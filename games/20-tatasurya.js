/* 20 Jelajah Tata Surya. Planet digambar dengan CSS (gradient, tanpa wajah) di atas langit gelap berbintang.
   TK: 6 soal pilih gambar. SD: urutkan 8 planet dari Matahari, lalu 5 soal fakta. Layar akhir: Matahari dengan planet beredar. */
(function () {
  const { h, shuffle, sample } = TI;

  // Planet dari yang paling dekat Matahari.
  const ORDER = ['merkurius', 'venus', 'bumi', 'mars', 'jupiter', 'saturnus', 'uranus', 'neptunus'];
  // k = ukuran badan relatif terhadap kotak. cls = kelas warna. parts = hiasan [kelas, gaya CSS].
  const crater = (l, t, s) => ['c', 'left:' + l + '%;top:' + t + '%;width:' + s + '%;height:' + s + '%'];
  const PL = {
    matahari: { name: 'Matahari', cls: 'sun', k: 0.9, parts: [] },
    merkurius: { name: 'Merkurius', cls: 'mer', k: 0.55, parts: [crater(22, 28, 18), crater(58, 52, 24), crater(28, 66, 12), crater(64, 22, 12), crater(44, 42, 8)] },
    venus: { name: 'Venus', cls: 'ven', k: 0.8, parts: [['c sw', 'left:-10%;top:28%;width:120%;height:13%'], ['c sw', 'left:-10%;top:56%;width:120%;height:10%']] },
    bumi: {
      name: 'Bumi', cls: 'bum', k: 0.82, parts: [
        ['c land', 'left:16%;top:18%;width:36%;height:28%;border-radius:55% 45% 60% 40%'],
        ['c land', 'left:50%;top:48%;width:32%;height:34%;border-radius:45% 55% 40% 60%'],
        ['c land', 'left:14%;top:62%;width:18%;height:16%;border-radius:50%'],
        ['c cl', 'left:6%;top:42%;width:46%;height:9%'], ['c cl', 'left:50%;top:14%;width:38%;height:8%'],
      ],
    },
    mars: { name: 'Mars', cls: 'mar', k: 0.62, parts: [['c dk', 'left:22%;top:36%;width:32%;height:22%'], ['c dk', 'left:58%;top:56%;width:24%;height:18%'], ['c cap', 'left:30%;top:-7%;width:40%;height:18%']] },
    jupiter: { name: 'Jupiter', cls: 'jup', k: 1, parts: [['c spot', 'left:56%;top:58%;width:22%;height:13%']] },
    saturnus: { name: 'Saturnus', cls: 'sat', k: 0.62, ring: 'rg', parts: [] },
    uranus: { name: 'Uranus', cls: 'ura', k: 0.78, ring: 'rg is-up', parts: [] },
    neptunus: { name: 'Neptunus', cls: 'nep', k: 0.76, parts: [['c sw', 'left:8%;top:36%;width:72%;height:9%'], ['c dk', 'left:56%;top:56%;width:22%;height:14%']] },
    bulan: { name: 'Bulan', cls: 'bln', k: 0.5, parts: [crater(24, 26, 22), crater(56, 48, 26), crater(30, 62, 14), crater(62, 20, 12)] },
  };

  // Satu planet (tanpa id SVG, jadi aman di-cloneNode). size = pengali ukuran (--s).
  function planet(id, size) {
    const d = PL[id];
    const body = h('i', { class: 'b' }, d.parts.map(([c, st]) => h('i', { class: c, style: st })));
    const el = h('span', { class: 'ta-pl is-' + d.cls, style: '--k:' + d.k + (size ? ';--s:' + size : ''), 'aria-hidden': 'true' });
    if (d.ring) el.append(h('i', { class: d.ring + ' back' }), body, h('i', { class: d.ring + ' front' }));
    else el.append(body);
    return el;
  }
  const opt = (id) => h('span', { class: 'ta-opt' }, planet(id), h('span', null, PL[id].name));

  // Latar bintang: beberapa titik putih yang diulang.
  const STARS = [[22, 34, 1.6], [96, 70, 1.2], [168, 26, 1.4], [220, 118, 1.8], [54, 150, 1.2], [132, 176, 1.6], [200, 214, 1.2], [18, 224, 1.4], [92, 120, 1], [246, 52, 1]];
  const starBg = STARS.map(([x, y, r]) => 'radial-gradient(' + r + 'px ' + r + 'px at ' + x + 'px ' + y + 'px, #fff 60%, transparent 66%)').join(',');
  const starSize = STARS.map(() => '260px 260px').join(',');

  // ---------- layar akhir: Matahari dengan 8 planet beredar ----------
  const ORB = {
    r: [36, 52, 68, 84, 113, 142, 167, 190],   // jari-jari orbit pada kotak 420
    box: [14, 20, 22, 18, 40, 61, 33, 33],     // ukuran kotak planet
    a0: [0.6, 2.4, 4.1, 5.5, 1.2, 3.3, 5.0, 0.2],
  };
  function buildOrrery(ctx) {
    const box = h('div', { class: 'ta-orr', role: 'img', 'aria-label': 'Matahari dengan delapan planet yang beredar mengelilinginya' });
    ORB.r.forEach((r) => box.append(h('i', { class: 'ta-orbit', style: 'width:' + ((r * 2) / 420) * 100 + '%;height:' + ((r * 2) / 420) * 100 + '%' })));
    const sun = planet('matahari'); sun.classList.add('ta-o'); box.append(sun);
    const rows = ORDER.map((id, i) => { const el = planet(id); el.classList.add('ta-o'); box.append(el); return { el, i }; });
    const moon = planet('bulan'); moon.classList.add('ta-o'); box.append(moon);
    let s = 1, t = 0;
    const put = () => {
      let ex = 0, ey = 0;
      rows.forEach(({ el, i }) => {
        const a = ORB.a0[i] + 0.5 * Math.pow(36 / ORB.r[i], 1.5) * t;
        const x = Math.cos(a) * ORB.r[i] * s, y = Math.sin(a) * ORB.r[i] * s;
        el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
        if (ORDER[i] === 'bumi') { ex = x; ey = y; }
      });
      const am = 3 + t * 2.2;
      moon.style.transform = 'translate3d(' + (ex + Math.cos(am) * 17 * s).toFixed(1) + 'px,' + (ey + Math.sin(am) * 17 * s).toFixed(1) + 'px,0)';
    };
    const layout = () => {
      s = Math.max(0.3, box.clientWidth / 420);
      sun.style.setProperty('--base', 49 * s + 'px');
      rows.forEach(({ el, i }) => el.style.setProperty('--base', ORB.box[i] * s + 'px'));
      moon.style.setProperty('--base', 15 * s + 'px');
      put();
    };
    return {
      box,
      start() {
        layout();
        ctx.on(window, 'resize', layout);
        if (!TI.reduced()) ctx.loop((dt) => { t += Math.max(0, dt); put(); });
      },
    };
  }

  const SD_FACTS = [
    { text: 'Planet apa yang paling besar?', ans: 'jupiter' },
    { text: 'Planet apa yang paling panas?', ans: 'venus', fixed: ['merkurius', 'mars', 'neptunus'] },
    { text: 'Planet mana yang disebut planet merah?', ans: 'mars' },
    { text: 'Planet mana yang paling dekat dengan Matahari?', ans: 'merkurius' },
    { text: 'Bumi adalah planet urutan ke berapa dari Matahari?', ans: 3, numbers: [2, 3, 4, 5] },
  ];
  const TK_Q = [
    { text: 'Mana Matahari?', ans: 'matahari', others: ['bumi', 'mars'] },
    { text: 'Mana Bumi?', ans: 'bumi', others: ['mars', 'venus'] },
    { text: 'Mana planet yang punya cincin?', ans: 'saturnus', others: ['mars', 'venus'] },
    { text: 'Mana Bulan?', ans: 'bulan', others: ['venus', 'mars'] },
    { text: 'Mana planet merah?', ans: 'mars', others: ['bumi', 'uranus'] },
    { text: 'Mana planet paling besar?', ans: 'jupiter', others: ['mars', 'bumi'], sizes: { jupiter: 1, mars: 0.7, bumi: 0.78 } },
  ];

  TI.register({
    id: 'tatasurya',
    title: 'Jelajah Tata Surya',
    cat: 'sains',
    icon: '🪐',
    desc: 'Kenali Matahari, Bumi, dan planet-planet di sekitarnya.',
    start(ctx) {
      TI.style('tatasurya', `
.play[data-game="tatasurya"] { --base: 76px; }
.play[data-game="tatasurya"] .stage { background: ${starBg}, linear-gradient(180deg, #0b1030, #1b2860); background-size: ${starSize}, 100% 100%; border-radius: var(--radius); padding: 16px 10px 22px; box-shadow: 0 5px 0 #0a0f2c; }
.play[data-game="tatasurya"] .choice { --base: 104px; }
.play[data-game="tatasurya"] .ti-slot { --base: 36px; }
.play[data-game="tatasurya"] .ti-piece { --base: 60px; }
.play[data-game="tatasurya"] .ta-pl { --d: calc(var(--base) * var(--s, 1)); position: relative; display: inline-block; flex: none; width: var(--d); height: var(--d); isolation: isolate; }
.play[data-game="tatasurya"] .ta-pl .b { position: absolute; z-index: 1; inset: calc((1 - var(--k, 1)) * var(--d) / 2); border-radius: 50%; overflow: hidden; background: var(--bg, #888); box-shadow: inset calc(var(--d) * -0.06) calc(var(--d) * -0.07) calc(var(--d) * 0.1) rgba(0, 0, 0, 0.35); }
.play[data-game="tatasurya"] .ta-pl .b::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.5), transparent 46%); }
.play[data-game="tatasurya"] .ta-pl .c { position: absolute; border-radius: 50%; background: rgba(0, 0, 0, 0.2); box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.25); }
.play[data-game="tatasurya"] .ta-pl .sw { background: rgba(255, 255, 255, 0.3); box-shadow: none; }
.play[data-game="tatasurya"] .ta-pl .dk { background: rgba(110, 35, 18, 0.45); box-shadow: none; }
.play[data-game="tatasurya"] .ta-pl .land { background: #43b063; box-shadow: none; }
.play[data-game="tatasurya"] .ta-pl .cl { background: rgba(255, 255, 255, 0.75); box-shadow: none; }
.play[data-game="tatasurya"] .ta-pl .cap { background: #fff; opacity: 0.85; box-shadow: none; }
.play[data-game="tatasurya"] .ta-pl .spot { background: #c8553d; box-shadow: none; }
.play[data-game="tatasurya"] .is-sun .b { --bg: radial-gradient(circle at 40% 36%, #fff6b0, #ffd23f 48%, #ff9f1c 100%); box-shadow: 0 0 calc(var(--d) * 0.3) rgba(255, 190, 50, 0.85); overflow: visible; }
.play[data-game="tatasurya"] .is-sun::before { content: ""; position: absolute; z-index: 0; inset: -8%; border-radius: 50%; background: repeating-conic-gradient(rgba(255, 190, 40, 0.95) 0 6deg, transparent 6deg 15deg); -webkit-mask-image: radial-gradient(circle closest-side, transparent 0 78%, #000 80%); mask-image: radial-gradient(circle closest-side, transparent 0 78%, #000 80%); }
.play[data-game="tatasurya"] .is-mer .b { --bg: radial-gradient(circle at 35% 30%, #d2cbc2, #9d958b 60%, #6f685f); }
.play[data-game="tatasurya"] .is-ven .b { --bg: radial-gradient(circle at 35% 30%, #fff0c2, #e8b76a 55%, #b9772e); }
.play[data-game="tatasurya"] .is-bum .b { --bg: radial-gradient(circle at 35% 30%, #8fd2ff, #2a7ad6 62%, #14438f); }
.play[data-game="tatasurya"] .is-mar .b { --bg: radial-gradient(circle at 35% 30%, #ffb08a, #e0582d 60%, #9c3417); }
.play[data-game="tatasurya"] .is-jup .b { --bg: linear-gradient(180deg, #ead7b4 0 10%, #c98f5a 10% 22%, #f1e3c8 22% 34%, #b9763f 34% 46%, #ecd5ad 46% 60%, #c4864f 60% 74%, #ead9b8 74% 88%, #c99660 88% 100%); }
.play[data-game="tatasurya"] .is-sat .b { --bg: linear-gradient(180deg, #f6e3b0 0 18%, #dcb870 18% 34%, #f1d7a0 34% 52%, #d1a85a 52% 70%, #ecd29a 70% 100%); }
.play[data-game="tatasurya"] .is-ura .b { --bg: radial-gradient(circle at 35% 30%, #d8fbff, #78d6de 58%, #3aa0ad); }
.play[data-game="tatasurya"] .is-nep .b { --bg: radial-gradient(circle at 35% 30%, #8ea8ff, #3351d8 58%, #16228a); }
.play[data-game="tatasurya"] .is-bln .b { --bg: radial-gradient(circle at 35% 30%, #f0f0f3, #b3b5c0 60%, #7f8294); }
.play[data-game="tatasurya"] .ta-pl .rg { position: absolute; left: -2%; right: -2%; top: 31%; bottom: 31%; border-radius: 50%; border: calc(var(--d) * 0.07) solid rgba(226, 194, 122, 0.95); transform: rotate(-18deg); }
.play[data-game="tatasurya"] .ta-pl .rg.back { z-index: 0; }
.play[data-game="tatasurya"] .ta-pl .rg.front { z-index: 2; clip-path: inset(50% 0 0 0); }
.play[data-game="tatasurya"] .ta-pl .rg.is-up { left: 36%; right: 36%; top: -4%; bottom: -4%; border-width: calc(var(--d) * 0.03); border-color: rgba(214, 246, 250, 0.9); transform: rotate(10deg); }
.play[data-game="tatasurya"] .ta-pl .rg.is-up.front { clip-path: inset(0 0 0 50%); }
.play[data-game="tatasurya"] .ta-opt { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 1.05rem; line-height: 1.1; }
.play[data-game="tatasurya"] .ti-choices.is-grid2 .choice { --base: 64px; }
.play[data-game="tatasurya"] .ta-sunrow { display: flex; align-items: center; justify-content: center; gap: 10px; color: #fff; font-weight: 800; font-size: 1.1rem; --base: 44px; }
.play[data-game="tatasurya"] .ta-orr { position: relative; width: min(100%, 420px); aspect-ratio: 1 / 1; flex: none; }
.play[data-game="tatasurya"] .ta-orbit { position: absolute; left: 50%; top: 50%; border: 1px dashed rgba(255, 255, 255, 0.25); border-radius: 50%; transform: translate(-50%, -50%); }
.play[data-game="tatasurya"] .ta-o { position: absolute; left: 50%; top: 50%; margin: calc(var(--d) / -2) 0 0 calc(var(--d) / -2); will-change: transform; }
@media (max-width: 560px) {
  .play[data-game="tatasurya"] .choice { --base: 68px; }
  .play[data-game="tatasurya"] .ti-choices { gap: 10px; }
  .play[data-game="tatasurya"] .ti-piece { --base: 54px; }
  .play[data-game="tatasurya"] .stage { padding: 12px 8px 18px; }
}
`);

      const tk = ctx.isTK;
      let tasks;
      if (tk) tasks = TK_Q.map((q) => ({ kind: 'tk', q }));
      else tasks = [{ kind: 'order' }, ...SD_FACTS.map((q) => ({ kind: 'fact', q }))];
      tasks.push({ kind: 'orrery' });

      ctx.series(tasks, async (task) => {
        if (task.kind === 'tk') {
          const q = task.q;
          ctx.ask(q.text);
          const ids = shuffle([q.ans, ...q.others]);
          await ctx.choose({
            options: ids.map((id) => ({ node: planet(id, q.sizes ? q.sizes[id] : 1), value: id, say: PL[id].name, aria: PL[id].name, cls: 'is-big' })),
            answer: q.ans,
            speakLabel: true,
          });
        } else if (task.kind === 'order') {
          ctx.ask('Urutkan planet dari yang paling dekat dengan Matahari!');
          ctx.el.append(h('div', { class: 'ta-sunrow' }, planet('matahari', 1), h('span', null, 'Matahari'), h('span', { 'aria-hidden': 'true' }, '➜ makin jauh')));
          await ctx.order({
            items: ORDER.map((id) => ({ label: PL[id].name, say: PL[id].name, node: planet(id) })),
            guide: 'after-wrong', label: 'Planet',
          });
          ctx.note('Matahari adalah bintang. Bulan mengelilingi Bumi, dan 8 planet mengelilingi Matahari.');
          await ctx.next('Lanjut');
        } else if (task.kind === 'fact') {
          const q = task.q;
          ctx.ask(q.text);
          if (q.numbers) {
            await ctx.choose({ options: q.numbers.map((n) => ({ label: 'ke-' + n, value: n, say: 'ke-' + n })), answer: q.ans, speakLabel: false });
          } else {
            const others = q.fixed || sample(ORDER.filter((id) => id !== q.ans), 3);
            const ids = shuffle([q.ans, ...others]);
            await ctx.choose({
              options: ids.map((id) => ({ node: opt(id), value: id, say: PL[id].name, aria: PL[id].name })),
              answer: q.ans, layout: 'is-grid2', speakLabel: false,
            });
          }
        } else {
          // layar akhir
          ctx.ask('Lihat! Planet-planet beredar mengelilingi Matahari.');
          const orr = buildOrrery(ctx);
          ctx.el.append(orr.box);
          orr.start();
          if (tk) ctx.note('Ada 8 planet yang mengelilingi Matahari. Bumi adalah planet ketiga, rumah kita.');
          else {
            ctx.note('Allah berfirman: Matahari dan bulan beredar menurut perhitungan. (QS Ar-Rahman ayat 5)', { title: 'Renungan', speak: false });
            ctx.say('Allah berfirman: Matahari dan bulan beredar menurut perhitungan. Surah Ar-Rahman ayat 5.');
          }
          await ctx.next('Selesai');
        }
      }, {
        lesson: 'Ada 8 planet yang mengelilingi Matahari. Bumi adalah planet ketiga, rumah kita.',
      });
    },
  });
})();
