/* 27 Arah Kiblat.
   Peta tampak atas: rumah di tengah, sajadah yang diputar (tombol putar, seret melingkar, atau panah keyboard),
   mawar angin di pojok, Ka'bah di tepi peta. Putar sajadah menghadap Ka'bah lalu tekan Cek.
   TK: 4 arah (per 90 derajat). SD: 8 arah (per 45 derajat) dengan nama arah mata angin. */
(function () {
  const { h, shuffle, rand } = TI;

  const NAMA8 = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
  const NAMA4 = ['atas', 'kanan', 'bawah', 'kiri']; // untuk TK, belum perlu nama mata angin
  const PANAH8 = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
  const PANAH4 = ['⬆️', '➡️', '⬇️', '⬅️'];

  const R_KA = 150; // jarak Ka'bah dari tengah peta
  const pohon = (x, y, r) => `<g><circle cx="${x + 3}" cy="${y + 4}" r="${r}" fill="#000" opacity="0.1"/><circle cx="${x}" cy="${y}" r="${r}" fill="#3f9d5a"/><circle cx="${x - r * 0.25}" cy="${y - r * 0.25}" r="${r * 0.62}" fill="#5fc279"/></g>`;
  const huruf = (t, x, y, w) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="10.5" font-weight="800" fill="${w || '#5a5f78'}" font-family="inherit">${t}</text>`;

  const MAP = `<svg viewBox="0 0 400 400" class="kb-svg" role="img" aria-label="Peta dengan rumah di tengah, sajadah, dan Ka'bah" focusable="false">
  <defs>
    <linearGradient id="kbGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6f1de"/><stop offset="1" stop-color="#bfe6cb"/></linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#kbGrass)"/>
  <path d="M50 0V400M100 0V400M150 0V400M200 0V400M250 0V400M300 0V400M350 0V400M0 50H400M0 100H400M0 150H400M0 200H400M0 250H400M0 300H400M0 350H400" stroke="#b3dcc0" stroke-width="1.2" opacity="0.7"/>
  <circle cx="200" cy="200" r="${R_KA}" fill="none" stroke="#9fd2b0" stroke-width="2.5" stroke-dasharray="3 9" stroke-linecap="round"/>
  ${pohon(366, 372, 16)}${pohon(30, 372, 14)}${pohon(372, 30, 15)}${pohon(342, 346, 10)}
  <g class="kb-house">
    <rect x="130" y="130" width="148" height="148" rx="14" fill="#000" opacity="0.08"/>
    <rect x="122" y="122" width="156" height="156" rx="14" fill="#f7e7c8" stroke="#b9794a" stroke-width="9"/>
    <path d="M161 131V269M200 131V269M239 131V269M131 161H269M131 200H269M131 239H269" stroke="#ecd7ae" stroke-width="1.5"/>
    <rect x="182" y="268" width="36" height="14" fill="#f7e7c8"/>
    <rect x="186" y="272" width="28" height="6" rx="3" fill="#d9a066"/>
    <rect x="146" y="117" width="22" height="9" rx="3" fill="#9fd8ff"/><rect x="232" y="117" width="22" height="9" rx="3" fill="#9fd8ff"/>
  </g>
  <g class="kb-dots"></g>
  <g class="kb-mat"><g class="kb-shake">
    <path class="kb-ray" d="M200 128V84" stroke="#0e9f6e" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 10" fill="none"/>
    <rect x="182" y="160" width="44" height="88" rx="9" fill="#000" opacity="0.14"/>
    <rect x="178" y="156" width="44" height="88" rx="9" fill="#1fa36f"/>
    <rect x="183" y="161" width="34" height="78" rx="6" fill="none" stroke="#ffe08a" stroke-width="2"/>
    <path d="M188 194V180Q188 166 200 162Q212 166 212 180V194Z" fill="#8fe3bd"/>
    <path d="M200 208l8 9l-8 9l-8 -9Z" fill="#ffe08a"/>
    <path d="M182 150V156M188 150V156M194 150V156M200 150V156M206 150V156M212 150V156M218 150V156M182 244V250M188 244V250M194 244V250M200 244V250M206 244V250M212 244V250M218 244V250" stroke="#f3e3b1" stroke-width="2" stroke-linecap="round"/>
    <path d="M200 132L191 148H209Z" fill="#fff3c4" stroke="#e0b84a" stroke-width="2" stroke-linejoin="round"/>
  </g></g>
  <g class="kb-ka"><g class="kb-ka-in">
    <circle r="29" fill="#fff" stroke="#d9d2c3" stroke-width="2"/>
    <path d="M-15 -14L-9 -21H21L15 -14Z" fill="#3b3b49"/>
    <rect x="-15" y="-14" width="30" height="30" rx="1.5" fill="#23232b"/>
    <rect x="-15" y="-7" width="30" height="5" fill="#e2b13c"/>
    <rect x="-5" y="3" width="9" height="13" rx="1.5" fill="#e2b13c"/>
    <text y="46" text-anchor="middle" font-size="13" font-weight="800" fill="#23232b" stroke="#fff" stroke-width="3.5" paint-order="stroke" font-family="inherit">Ka'bah</text>
  </g></g>
  <g transform="translate(44 44)">
    <circle r="31" fill="#fff" fill-opacity="0.92" stroke="#cdbfa2" stroke-width="2"/>
    <path d="M0 -13L4.5 0H-4.5Z" fill="#e5484d"/><path d="M0 13L4.5 0H-4.5Z" fill="#9aa3b5"/>
    ${huruf('U', 0, -22, '#e5484d')}${huruf('T', 22, 0)}${huruf('S', 0, 22)}${huruf('B', -22, 0)}
  </g>
</svg>`;

  const CSS = `
    & .kb-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px; flex: none; }
    & .kb-scene { flex: none; width: min(100%, 400px); min-height: 0; aspect-ratio: 1 / 1; background: #cdeed7; touch-action: none; cursor: grab; }
    & .kb-svg { display: block; width: 100%; height: 100%; touch-action: none; }
    & .kb-mat { transform-origin: 200px 200px; transition: transform var(--dur-ui-max) var(--ease-in-out); }
    & .kb-shake, & .kb-ka-in { transform-box: fill-box; transform-origin: center; }
    & .kb-shake.is-wrong { animation: kb-shake var(--dur-ui-max) var(--ease-in-out); }
    @keyframes kb-shake { 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(2px); } }
    & .kb-ka-in.is-hint { animation: kb-hint 800ms var(--ease-in-out) 4; } /* motion-ok: Ka'bah berdenyut sebagai petunjuk, muncul jarang */
    @keyframes kb-hint { 50% { transform: scale(1.22); } }
    & .kb-ka-in.is-yay { animation: kb-yay 520ms var(--ease-pop); } /* motion-ok: Ka'bah memantul saat benar */
    @keyframes kb-yay { 40% { transform: scale(1.3); } }
    & .kb-dot { opacity: 0; animation: kb-dot 360ms var(--ease-out) forwards; animation-delay: calc(var(--i) * 90ms); } /* motion-ok: titik jalur menyala berurutan */
    @keyframes kb-dot { from { opacity: 0; } to { opacity: 1; } }
    &.lvl-sd .kb-ray { display: none; }
    & .kb-info { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; margin: 0; font-weight: 800; font-size: 1.15rem; text-align: center; }
    & .kb-info b { color: var(--c); }
    & .kb-btns { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; }
    & .kb-btns .ti-btn { min-height: 64px; }
    & .kb-turn { min-width: 84px; padding: 8px 18px; font-size: 2rem; line-height: 1; }
    & .kb-cek { min-width: 150px; }
    & .kb-q { display: inline-flex; align-items: center; gap: 8px; }
    @media (max-width: 560px) {
      & .kb-turn { min-width: 76px; }
      & .kb-cek { min-width: 130px; }
    }
  `.replace(/&/g, '.play[data-game="kiblat"]');

  // Satu babak: putar sajadah menghadap Ka'bah. Selesai saat benar (atau setelah 3 kali salah).
  async function babakPutar(ctx, { n, start, target }) {
    const step = 360 / n;
    const nama = (i) => (n === 8 ? NAMA8[i] : NAMA4[i]);
    const panah = (i) => (n === 8 ? PANAH8[i] : PANAH4[i]);
    const box = h('div', { class: 'ti-scene kb-scene', html: MAP });
    const svg = box.querySelector('svg');
    const mat = svg.querySelector('.kb-mat'), shake = svg.querySelector('.kb-shake');
    const ka = svg.querySelector('.kb-ka'), kaIn = svg.querySelector('.kb-ka-in'), dots = svg.querySelector('.kb-dots');
    const info = h('p', { class: 'kb-info' });
    const bTurunKiri = h('button', { type: 'button', class: 'ti-btn is-ghost kb-turn', 'aria-label': 'Putar sajadah ke kiri' }, '↺');
    const bTurunKanan = h('button', { type: 'button', class: 'ti-btn is-ghost kb-turn', 'aria-label': 'Putar sajadah ke kanan' }, '↻');
    const bCek = h('button', { type: 'button', class: 'ti-btn kb-cek' }, 'Cek ✔️');
    ctx.el.append(h('div', { class: 'kb-wrap' }, box, info, h('div', { class: 'kb-btns' }, bTurunKiri, bCek, bTurunKanan)));

    // Ka'bah di tepi peta pada arah target (0 = atas, searah jarum jam).
    const rad = (target * step * Math.PI) / 180;
    ka.style.transform = 'translate(' + (200 + R_KA * Math.sin(rad)).toFixed(1) + 'px,' + (200 - R_KA * Math.cos(rad)).toFixed(1) + 'px)';

    let angle = start * step, busy = false, salah = 0;
    const facing = () => ((Math.round(angle / step) % n) + n) % n;
    const tulisInfo = () => {
      const f = facing();
      info.replaceChildren(h('span', { 'aria-hidden': 'true' }, panah(f)), h('span', null, 'Sajadah menghadap: '), h('b', null, nama(f)));
    };
    const pasang = () => { mat.style.transform = 'rotate(' + angle + 'deg)'; tulisInfo(); };
    mat.style.transition = 'none'; pasang(); void mat.getBoundingClientRect(); mat.style.transition = '';

    function putar(d) {
      if (busy) return;
      angle += d * step; pasang(); ctx.sfx('flip');
    }
    bTurunKiri.addEventListener('click', () => putar(-1));
    bTurunKanan.addEventListener('click', () => putar(1));
    ctx.on(document, 'keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); putar(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); putar(1); }
    });

    // Seret melingkar di peta: sajadah mengikuti jari, patah per langkah.
    let seret = null;
    const sudutJari = (e) => {
      const r = svg.getBoundingClientRect();
      return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    };
    svg.addEventListener('pointerdown', (e) => {
      if (busy || e.button > 0) return;
      seret = { last: sudutJari(e), acc: 0, base: angle };
      try { svg.setPointerCapture(e.pointerId); } catch (_) { /* tidak didukung */ }
    });
    svg.addEventListener('pointermove', (e) => {
      if (!seret || busy) return;
      const a = sudutJari(e);
      let d = a - seret.last;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      seret.last = a; seret.acc += d;
      const baru = Math.round((seret.base + seret.acc) / step) * step;
      if (baru !== angle) { angle = baru; pasang(); ctx.sfx('flip'); }
    });
    const lepas = () => { seret = null; };
    svg.addEventListener('pointerup', lepas);
    svg.addEventListener('pointercancel', lepas);

    // Jalur titik bercahaya dari sajadah ke Ka'bah.
    function jalur() {
      const sin = Math.sin(rad), cos = Math.cos(rad);
      for (let i = 0, r = 62; r < R_KA - 34; i++, r += 13) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', (200 + r * sin).toFixed(1)); c.setAttribute('cy', (200 - r * cos).toFixed(1));
        c.setAttribute('r', 4.2); c.setAttribute('fill', '#ffc93c'); c.setAttribute('stroke', '#e0a100'); c.setAttribute('stroke-width', 1.5);
        c.setAttribute('class', 'kb-dot'); c.style.setProperty('--i', i);
        dots.append(c);
      }
    }
    const selesai = async (ucap) => {
      busy = true;
      [bTurunKiri, bTurunKanan, bCek].forEach((b) => { b.disabled = true; });
      jalur();
      kaIn.classList.remove('is-hint'); kaIn.classList.add('is-yay');
      await ctx.correct(null, { say: false, min: 500 });
      await ctx.sayWait(ucap);
    };

    bCek.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      const f = facing();
      if (f === target) {
        await selesai(ctx.isSD ? 'Benar, ke ' + nama(target).toLowerCase() + '!' : 'Benar! Ka\'bah ada di arah ' + nama(target) + '.');
        done();
        return;
      }
      salah++;
      if (salah >= 3) {
        // Tiga kali salah: sajadah berputar sendiri ke arah yang benar, lalu lanjut.
        busy = true;
        await ctx.wrong(shake, { say: false, min: 350 });
        let d = (((target - f + n / 2) % n) + n) % n - n / 2;
        if (d === -n / 2) d = n / 2;
        angle += d * step; pasang(); ctx.sfx('flip');
        await ctx.wait(420);
        await selesai(ctx.isSD ? 'Ini arahnya, ke ' + nama(target).toLowerCase() + '. Sajadah menghadap Ka\'bah.' : 'Ini arahnya. Sajadah menghadap Ka\'bah.');
        done();
        return;
      }
      const pesan = ctx.isSD ? 'Belum tepat. Sajadahmu menghadap ke ' + nama(f).toLowerCase() + '. Putar lagi ya.' : 'Belum tepat. Ayo putar lagi, hadapkan ke Ka\'bah.';
      await ctx.wrong(shake, { say: pesan, min: 500 });
      if (salah >= 2) kaIn.classList.add('is-hint');
      busy = false;
    });

    let done;
    return new Promise((res) => { done = res; });
  }

  // Urutan arah target supaya tidak sama dua kali berturut-turut.
  function rencanaBabak(n, jumlah, jarak) {
    const hasil = [];
    let prev = -1;
    for (let i = 0; i < jumlah; i++) {
      let t;
      do { t = rand(0, n - 1); } while (t === prev);
      prev = t;
      const d = jarak[i] * (Math.random() < 0.5 ? 1 : -1);
      hasil.push({ n, target: t, start: (((t - d) % n) + n) % n });
    }
    return hasil;
  }

  TI.register({
    id: 'kiblat',
    title: 'Arah Kiblat',
    cat: 'islam',
    icon: '🧭',
    desc: 'Putar sajadah supaya menghadap Ka\'bah.',
    start(ctx) {
      TI.style('kiblat', CSS);
      const babak = ctx.isTK ? rencanaBabak(4, 5, [1, 1, 2, 1, 2]) : rencanaBabak(8, 5, [1, 2, 2, 3, 4]);
      const soal = babak.map((b) => async () => {
        ctx.ask('Putar sajadah menghadap Ka\'bah!');
        await babakPutar(ctx, b);
      });

      if (ctx.isTK) {
        soal.push(async () => {
          ctx.ask('Saat shalat kita menghadap ke?');
          await ctx.choose({
            options: shuffle([
              { node: h('span', { class: 'kb-q' }, h('span', { 'aria-hidden': 'true' }, '🕋'), " Ka'bah"), value: 'a', say: "Ka'bah" },
              { node: h('span', { class: 'kb-q' }, h('span', { 'aria-hidden': 'true' }, '☀️'), ' Matahari'), value: 'b', say: 'Matahari' },
              { node: h('span', { class: 'kb-q' }, h('span', { 'aria-hidden': 'true' }, '🌙'), ' Bulan'), value: 'c', say: 'Bulan' },
            ]),
            answer: 'a',
            layout: 'is-col',
          });
          ctx.note('Kiblat adalah arah Ka\'bah di Makkah.', { title: 'Ingat' });
          await ctx.next();
        });
      } else {
        const tanya = (q, a, w, akhir) => async () => {
          ctx.ask(q);
          await ctx.choose({ options: shuffle([a, ...w]), answer: a });
          if (akhir) {
            ctx.note('Ka\'bah ada di Makkah, di sebelah barat laut Indonesia. Karena itu di Indonesia kita shalat menghadap ke barat laut.', { title: 'Tahukah kamu?' });
            await ctx.next();
          }
        };
        soal.push(
          tanya('Matahari terbit di sebelah?', 'Timur', ['Barat', 'Utara']),
          tanya('Matahari terbenam di sebelah?', 'Barat', ['Timur', 'Selatan']),
          tanya('Dari Indonesia, kiblat menghadap ke arah?', 'Barat Laut', ['Timur', 'Selatan'], true),
        );
      }
      return ctx.series(soal, (jalankan) => jalankan(), {
        lesson: 'Kiblat adalah arah Ka\'bah di Makkah. Dari Indonesia, kiblat ada di arah barat laut.',
      });
    },
  });
})();
