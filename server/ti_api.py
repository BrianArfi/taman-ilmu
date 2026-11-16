#!/usr/bin/env python3
# Taman Ilmu score + stats API. Stdlib only, SQLite, listens on 127.0.0.1 only.
# Caddy publishes /score, /board, /stats, /stats/* for it; /ping stays loopback-only.
# Salinan kanonis di repo taman-ilmu/server/; yang jalan di box 149
# /opt/taman-ilmu-api/ti_api.py (systemd taman-ilmu-api.service).
import json
import os
import re
import sqlite3
import threading
import time
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

DB_PATH = os.environ.get("TI_DB", "/var/lib/taman-ilmu-api/scores.db")
PORT = int(os.environ.get("TI_PORT", "8792"))
MAX_BODY = 4096
MAX_BODY_STATS = 16384  # per_game 102 game muat (~4 KB)

WIB = timezone(timedelta(hours=7))
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)
WEEK_RE = re.compile(r"^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$")
CHAR_OK = re.compile(r"^[\w '’\-]$", re.UNICODE)
EMOJI_OK = set("⭐🌙🌈🌸🌻🍀🍎⚽🎈💎🚀🔥🥇🏆")
BOUNDS = {"xp": (0, 3000), "stars_week": (0, 150), "plays": (0, 2000), "games_done": (0, 50)}
RATE = {"player": 200, "ip": 400}  # per WIB day
RATE_STATS = {"player": 600, "ip": 1500}  # event main/selesai per game
DAY_CAP_ROWS_PER_PLAYER_WEEK = 40
GID_RE = re.compile(r"^[a-z0-9-]{1,40}$")
DAY_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SNAP_FIELDS = ("visits", "days_active", "plays", "finishes", "stars", "shares",
               "challenges", "cards")
SNAP_MAX = 1000000  # counter kumulatif seumur hidup per perangkat

_rate_lock = threading.Lock()
_rate = {}  # key -> (wib_date, count)


def now_wib():
    return datetime.now(WIB)


def week_key(d):
    y, w, _ = d.isocalendar()
    return "%04d-W%02d" % (y, w)


def allowed_week_keys():
    today = now_wib().date()
    return {week_key(today - timedelta(days=o)) for o in (0, 7, 14)}


def nick_ok(name):
    if not isinstance(name, str):
        return False
    name = re.sub(r"\s+", " ", name).strip()
    if not (2 <= len(name) <= 16):
        return False
    for ch in name:
        if not (CHAR_OK.match(ch) or ch in EMOJI_OK):
            return False
    return True


def rate_ok(key, cap):
    day = now_wib().date()
    with _rate_lock:
        d, n = _rate.get(key, (day, 0))
        if d != day:
            d, n = day, 0
        if n >= cap:
            return False
        _rate[key] = (d, n + 1)
        # prune: keep the map small
        if len(_rate) > 5000:
            for k in [k for k, (dd, _) in _rate.items() if dd != day]:
                del _rate[k]
        return True


def db():
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with db() as c:
        c.execute(
            """CREATE TABLE IF NOT EXISTS ti_scores (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 player_id TEXT NOT NULL,
                 nickname TEXT NOT NULL,
                 week_key TEXT NOT NULL,
                 jenjang TEXT NOT NULL,
                 xp INTEGER NOT NULL,
                 stars_week INTEGER NOT NULL,
                 plays INTEGER NOT NULL,
                 games_done INTEGER NOT NULL,
                 client_time REAL NOT NULL,
                 created_at TEXT NOT NULL)"""
        )
        c.execute("CREATE INDEX IF NOT EXISTS ti_week ON ti_scores(week_key, jenjang)")
        c.execute("CREATE INDEX IF NOT EXISTS ti_player ON ti_scores(player_id)")
        c.execute(
            """CREATE TABLE IF NOT EXISTS ti_snapshots (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 player_id TEXT NOT NULL,
                 day TEXT NOT NULL,
                 week_key TEXT NOT NULL,
                 visits INTEGER NOT NULL,
                 days_active INTEGER NOT NULL,
                 plays INTEGER NOT NULL,
                 finishes INTEGER NOT NULL,
                 stars INTEGER NOT NULL,
                 shares INTEGER NOT NULL,
                 challenges INTEGER NOT NULL,
                 cards INTEGER NOT NULL,
                 client_time REAL NOT NULL,
                 created_at TEXT NOT NULL)"""
        )
        c.execute("CREATE INDEX IF NOT EXISTS ti_snap_player ON ti_snapshots(player_id)")
        c.execute(
            """CREATE TABLE IF NOT EXISTS ti_events (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 player_id TEXT NOT NULL,
                 day TEXT NOT NULL,
                 week_key TEXT NOT NULL,
                 gid TEXT NOT NULL,
                 kind TEXT NOT NULL,
                 stars INTEGER NOT NULL,
                 created_at TEXT NOT NULL)"""
        )
        c.execute("CREATE INDEX IF NOT EXISTS ti_ev_day ON ti_events(day, gid)")
        c.execute("CREATE INDEX IF NOT EXISTS ti_ev_week ON ti_events(week_key, gid)")
        c.execute("CREATE INDEX IF NOT EXISTS ti_ev_gid ON ti_events(gid)")


def validate_score(b):
    errs = []
    if not isinstance(b, dict):
        return ["body bukan objek"]
    pid = b.get("player_id")
    if not (isinstance(pid, str) and UUID_RE.match(pid)):
        errs.append("player_id bukan UUID")
    if not nick_ok(b.get("nickname")):
        errs.append("nickname 2-16 huruf")
    wk = b.get("week_key")
    if not (isinstance(wk, str) and WEEK_RE.match(wk)):
        errs.append("week_key format YYYY-Www")
    elif wk not in allowed_week_keys():
        errs.append("week_key di luar jendela")
    if b.get("jenjang") not in ("tk", "sd"):
        errs.append("jenjang tk atau sd")
    for f, (lo, hi) in BOUNDS.items():
        v = b.get(f)
        if not isinstance(v, int) or isinstance(v, bool) or not (lo <= v <= hi):
            errs.append("%s di luar batas" % f)
    ct = b.get("client_time", time.time())
    if not isinstance(ct, (int, float)) or isinstance(ct, bool):
        errs.append("client_time bukan angka")
    return errs, (wk if isinstance(wk, str) else None), (pid if isinstance(pid, str) else None)


def _is_int(v):
    return isinstance(v, int) and not isinstance(v, bool)


def validate_stats(b):
    errs = []
    if not isinstance(b, dict):
        return ["body bukan objek"], None, None
    pid = b.get("player_id")
    if not (isinstance(pid, str) and UUID_RE.match(pid)):
        errs.append("player_id bukan UUID")
    wk = b.get("week_key")
    if not (isinstance(wk, str) and WEEK_RE.match(wk)):
        errs.append("week_key format YYYY-Www")
    elif wk not in allowed_week_keys():
        errs.append("week_key di luar jendela")
    for f in SNAP_FIELDS:
        v = b.get(f)
        if not _is_int(v) or not (0 <= v <= SNAP_MAX):
            errs.append("%s di luar batas" % f)
    pg = b.get("per_game")
    if pg is not None:
        if not isinstance(pg, dict) or len(pg) > 120:
            errs.append("per_game kebesaran")
        else:
            for gid, g in pg.items():
                if not (isinstance(gid, str) and GID_RE.match(gid)):
                    errs.append("gid tidak sah")
                    break
                if not isinstance(g, dict):
                    errs.append("per_game isi bukan objek")
                    break
                for k in ("s", "f", "b"):
                    v = g.get(k)
                    if not _is_int(v) or not (0 <= v <= SNAP_MAX):
                        errs.append("per_game %s.%s di luar batas" % (gid, k))
                        break
                else:
                    continue
                break
    ct = b.get("client_time", time.time())
    if not isinstance(ct, (int, float)) or isinstance(ct, bool):
        errs.append("client_time bukan angka")
    return errs, (wk if isinstance(wk, str) else None), (pid if isinstance(pid, str) else None)


def validate_event(b):
    errs = []
    if not isinstance(b, dict):
        return ["body bukan objek"], None
    pid = b.get("player_id")
    if not (isinstance(pid, str) and UUID_RE.match(pid)):
        errs.append("player_id bukan UUID")
    if not (isinstance(b.get("gid"), str) and GID_RE.match(b["gid"])):
        errs.append("gid tidak sah")
    if b.get("kind") not in ("play", "finish"):
        errs.append("kind play atau finish")
    st = b.get("stars", 0)
    if not _is_int(st) or not (0 <= st <= 3):
        errs.append("stars 0-3")
    return errs, (pid if isinstance(pid, str) else None)


class Handler(BaseHTTPRequestHandler):
    server_version = "ti-api/1.1"
    protocol_version = "HTTP/1.1"

    def _headers(self, code, ctype="application/json", cors=True):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        if cors:
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Max-Age", "86400")
        body = getattr(self, "_body", b"")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()

    def _json(self, code, obj, cors=True):
        self._body = json.dumps(obj).encode("utf-8")
        self._headers(code, cors=cors)
        self.wfile.write(self._body)

    def _text(self, code, text):
        self._body = text.encode("utf-8")
        self._headers(code, ctype="text/plain; charset=utf-8", cors=False)
        self.wfile.write(self._body)

    def log_message(self, fmt, *args):
        # one compact line; journald picks it up
        print("%s %s" % (self.address_string(), fmt % args), flush=True)

    def do_OPTIONS(self):
        self._text(204, "")

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        try:
            if u.path == "/ping":
                return self._text(200, "ok")
            if u.path == "/board":
                return self.board(q)
            if u.path == "/stats/summary":
                return self.stats_summary()
            if u.path == "/stats/populer":
                return self.populer(q)
            if u.path == "/stats/harian":
                return self.harian(q)
            return self._json(404, {"ok": False, "error": "path tidak ada"})
        except Exception as e:  # noqa: BLE001
            print("GET error: %r" % e, flush=True)
            return self._json(500, {"ok": False, "error": "server error"})

    def _read_json(self, limit):
        # Kembalikan (objek, gagal); kalau gagal respons sudah terkirim.
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0 or n > limit:
            self._json(413, {"ok": False, "error": "body kebesaran"})
            return None, True
        raw = self.rfile.read(n)
        try:
            return json.loads(raw.decode("utf-8")), False
        except Exception:
            self._json(400, {"ok": False, "error": "json rusak"})
            return None, True

    def do_POST(self):
        u = urlparse(self.path)
        try:
            if u.path == "/stats":
                return self.post_stats()
            if u.path == "/stats/event":
                return self.post_event()
            if u.path != "/score":
                return self._json(404, {"ok": False, "error": "path tidak ada"})
            b, gagal = self._read_json(MAX_BODY)
            if gagal:
                return
            errs, wk, pid = validate_score(b)
            if errs:
                return self._json(400, {"ok": False, "error": "; ".join(errs)})
            if not rate_ok("p:" + pid, RATE["player"]) or not rate_ok(
                "i:" + self.client_address[0], RATE["ip"]
            ):
                return self._json(429, {"ok": False, "error": "kebanyakan kirim"})
            with db() as c:
                row = c.execute(
                    "SELECT COUNT(*) n FROM ti_scores WHERE player_id=? AND week_key=?",
                    (pid, wk),
                ).fetchone()
                if row["n"] >= DAY_CAP_ROWS_PER_PLAYER_WEEK:
                    return self._json(429, {"ok": False, "error": "pekan ini penuh"})
                c.execute(
                    """INSERT INTO ti_scores
                       (player_id, nickname, week_key, jenjang, xp, stars_week, plays,
                        games_done, client_time, created_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?)""",
                    (
                        pid,
                        re.sub(r"\s+", " ", b["nickname"]).strip(),
                        wk,
                        b["jenjang"],
                        b["xp"],
                        b["stars_week"],
                        b["plays"],
                        b["games_done"],
                        float(b.get("client_time") or time.time()),
                        now_wib().isoformat(timespec="seconds"),
                    ),
                )
            return self._json(200, {"ok": True})
        except Exception as e:  # noqa: BLE001
            print("POST error: %r" % e, flush=True)
            return self._json(500, {"ok": False, "error": "server error"})

    def board(self, q):
        mode = q.get("mode", ["week"])[0]
        jen = q.get("jenjang", ["tk"])[0]
        if jen not in ("tk", "sd"):
            return self._json(400, {"ok": False, "error": "jenjang tk atau sd"})
        me = q.get("me", [None])[0]
        if me is not None and not UUID_RE.match(me):
            me = None
        if mode not in ("week", "all"):
            mode = "week"
        wk = q.get("week", [None])[0]
        if mode == "week":
            if not wk or not WEEK_RE.match(wk):
                wk = week_key(now_wib())
            sql = """SELECT player_id,
                            (SELECT nickname FROM ti_scores r2 WHERE r2.player_id = r1.player_id
                             ORDER BY r2.id DESC LIMIT 1) nick,
                            MAX(xp) xp, MAX(stars_week) stars, SUM(plays) plays
                     FROM ti_scores r1
                     WHERE week_key=? AND jenjang=?
                     GROUP BY player_id
                     ORDER BY xp DESC, plays ASC, nick ASC"""
            args = (wk, jen)
        else:
            wk = None
            sql = """SELECT player_id, SUM(xp) xp, SUM(stars) stars, SUM(plays) plays,
                            MAX(nick) nick
                     FROM (SELECT player_id, week_key, MAX(xp) xp, MAX(stars_week) stars,
                                  SUM(plays) plays,
                                  (SELECT nickname FROM ti_scores r2
                                   WHERE r2.player_id = r1.player_id
                                   ORDER BY r2.id DESC LIMIT 1) nick
                           FROM ti_scores r1 WHERE jenjang=?
                           GROUP BY player_id, week_key)
                     GROUP BY player_id
                     ORDER BY xp DESC, plays ASC, nick ASC"""
            args = (jen,)
        with db() as c:
            rows = [dict(r) for r in c.execute(sql, args).fetchall()]
        rows.sort(key=lambda r: (-r["xp"], r["plays"], (r["nick"] or "").lower()))
        out, mine = [], None
        for i, r in enumerate(rows, 1):
            item = {
                "rank": i,
                "nickname": r["nick"],
                "xp": r["xp"],
                "stars": r["stars"],
                "plays": r["plays"],
                "me": bool(me and r["player_id"] == me),
            }
            if item["me"]:
                mine = item
            if i <= 20 or item["me"]:
                out.append(item)
        if mine is None and me:
            pass  # belum ada baris: klien menampilkan dirinya dari state lokal
        resp = {"ok": True, "mode": mode, "jenjang": jen, "rows": out,
                "week": wk, "generated": now_wib().isoformat(timespec="seconds")}
        return self._json(200, resp)

    def post_stats(self):
        b, gagal = self._read_json(MAX_BODY_STATS)
        if gagal:
            return
        errs, wk, pid = validate_stats(b)
        if errs:
            return self._json(400, {"ok": False, "error": "; ".join(errs)})
        if not rate_ok("s:" + pid, RATE_STATS["player"]) or not rate_ok(
            "i:" + self.client_address[0], RATE_STATS["ip"]
        ):
            return self._json(429, {"ok": False, "error": "kebanyakan kirim"})
        now = now_wib()
        with db() as c:
            c.execute(
                """INSERT INTO ti_snapshots
                   (player_id, day, week_key, visits, days_active, plays, finishes,
                    stars, shares, challenges, cards, client_time, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (pid, now.date().isoformat(), wk,
                 b["visits"], b["days_active"], b["plays"], b["finishes"],
                 b["stars"], b["shares"], b["challenges"], b["cards"],
                 float(b.get("client_time") or time.time()),
                 now.isoformat(timespec="seconds")),
            )
        # per_game divalidasi tapi tidak disimpan: data per game datang dari /stats/event.
        return self._json(200, {"ok": True})

    def post_event(self):
        b, gagal = self._read_json(MAX_BODY)
        if gagal:
            return
        errs, pid = validate_event(b)
        if errs:
            return self._json(400, {"ok": False, "error": "; ".join(errs)})
        if not rate_ok("e:" + pid, RATE_STATS["player"]) or not rate_ok(
            "i:" + self.client_address[0], RATE_STATS["ip"]
        ):
            return self._json(429, {"ok": False, "error": "kebanyakan kirim"})
        now = now_wib()
        with db() as c:
            c.execute(
                """INSERT INTO ti_events
                   (player_id, day, week_key, gid, kind, stars, created_at)
                   VALUES (?,?,?,?,?,?,?)""",
                (pid, now.date().isoformat(), week_key(now.date()),
                 b["gid"], b["kind"], b.get("stars", 0),
                 now.isoformat(timespec="seconds")),
            )
        return self._json(200, {"ok": True})

    def stats_summary(self):
        now = now_wib()
        day = now.date().isoformat()
        wk = week_key(now.date())
        with db() as c:
            latest = """SELECT * FROM ti_snapshots s WHERE id IN
                        (SELECT MAX(id) FROM ti_snapshots GROUP BY player_id)"""
            tot = c.execute(
                "SELECT COUNT(DISTINCT player_id) v, COALESCE(SUM(plays),0) p,"
                " COALESCE(SUM(finishes),0) f, COALESCE(SUM(shares),0) s"
                " FROM (%s)" % latest
            ).fetchone()
            ev_day = c.execute(
                "SELECT COUNT(DISTINCT player_id) p, COUNT(*) n,"
                " COALESCE(SUM(kind='finish'),0) f FROM ti_events WHERE day=?",
                (day,),
            ).fetchone()
            ev_week = c.execute(
                "SELECT COUNT(DISTINCT player_id) p, COUNT(*) n,"
                " COALESCE(SUM(kind='finish'),0) f FROM ti_events WHERE week_key=?",
                (wk,),
            ).fetchone()
        return self._json(200, {
            "ok": True,
            "visitors": tot["v"], "plays": tot["p"],
            "finishes": tot["f"], "shares": tot["s"],
            "day": {"date": day, "players": ev_day["p"], "plays": ev_day["n"],
                    "finishes": ev_day["f"]},
            "week": {"key": wk, "players": ev_week["p"], "plays": ev_week["n"],
                     "finishes": ev_week["f"]},
            "generated": now.isoformat(timespec="seconds"),
        })

    def populer(self, q):
        window = q.get("window", ["week"])[0]
        if window not in ("day", "week", "all"):
            window = "week"
        now = now_wib()
        if window == "day":
            key = now.date().isoformat()
            where, args = "day=?", (key,)
        elif window == "week":
            key = week_key(now.date())
            where, args = "week_key=?", (key,)
        else:
            key = "all"
            where, args = "1=1", ()
        with db() as c:
            rows = c.execute(
                "SELECT gid, COUNT(*) plays,"
                " COALESCE(SUM(kind='finish'),0) finishes,"
                " COUNT(DISTINCT player_id) players FROM ti_events"
                " WHERE %s GROUP BY gid"
                " ORDER BY plays DESC, finishes DESC, gid ASC LIMIT 10" % where,
                args,
            ).fetchall()
        return self._json(200, {
            "ok": True, "window": window, "key": key,
            "games": [dict(r) for r in rows],
            "generated": now.isoformat(timespec="seconds"),
        })

    def harian(self, q):
        try:
            n = max(1, min(30, int(q.get("days", ["7"])[0])))
        except ValueError:
            n = 7
        with db() as c:
            rows = c.execute(
                "SELECT day, COUNT(DISTINCT player_id) players, COUNT(*) plays,"
                " COALESCE(SUM(kind='finish'),0) finishes FROM ti_events"
                " GROUP BY day ORDER BY day DESC LIMIT ?", (n,),
            ).fetchall()
        return self._json(200, {
            "ok": True, "days": [dict(r) for r in rows],
            "generated": now_wib().isoformat(timespec="seconds"),
        })


def main():
    init_db()
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    srv.daemon_threads = True
    print("ti-api listening on 127.0.0.1:%d db=%s" % (PORT, DB_PATH), flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
