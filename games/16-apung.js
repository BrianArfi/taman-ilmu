/* 16 Tenggelam atau Terapung. Akuarium di .ti-scene: benda jatuh ke air dengan fisika sederhana (ctx.loop + transform).
   rho = kerapatan benda dibanding air. rho < 1 terapung (tenggelam sebagian sampai seimbang), rho > 1 tenggelam ke pasir. */
(function () {
  const { h, svg, rand, pick, shuffle, sample } = TI;

  const BENDA = [
    { id: 'kayu', em: '🪵', nama: 'Kayu', apung: true, rho: 0.55, why: 'Kayu terapung karena kayu lebih ringan dari air.' },
    { id: 'batu', em: '🪨', nama: 'Batu', apung: false, rho: 2.6, why: 'Batu tenggelam karena batu padat dan berat.' },
    { id: 'paku', em: '🔩', nama: 'Paku besi', apung: false, rho: 4, why: 'Paku besi tenggelam. Besi lebih berat dari air, walaupun kecil.' },
    { id: 'bola', em: '⚽', nama: 'Bola', apung: true, rho: 0.3, why: 'Bola terapung karena di dalam bola ada udara.' },
    { id: 'daun', em: '🍃', nama: 'Daun', apung: true, rho: 0.2, why: 'Daun terapung karena daun tipis dan ringan.' },
    { id: 'kunci', em: '🔑', nama: 'Kunci', apung: false, rho: 3.5, why: 'Kunci tenggelam karena terbuat dari logam.' },
    { id: 'apel', em: '🍎', nama: 'Apel', apung: true, rho: 0.6, why: 'Apel terapung karena di dalam apel ada banyak udara.' },
    { id: 'es', em: '🧊', nama: 'Es batu', apung: true, rho: 0.8, why: 'Es batu terapung karena es lebih ringan dari air.' },
    { id: 'telur', em: '🥚', nama: 'Telur', apung: false, rho: 1.7, why: 'Telur tenggelam di air tawar.', whySD: ' Kalau airnya diberi banyak garam, telur bisa terapung!' },
    { id: 'sendok', em: '🥄', nama: 'Sendok logam', apung: false, rho: 3.5, why: 'Sendok logam tenggelam karena terbuat dari logam.' },
    { id: 'kelapa', em: '🥥', nama: 'Kelapa', apung: true, rho: 0.6, why: 'Kelapa terapung karena sabutnya berisi udara.' },
    { id: 'gunting', em: '✂️', nama: 'Gunting', apung: false, rho: 3.5, why: 'Gunting tenggelam karena terbuat dari logam.' },
  ];

  // Permukaan air bergelombang halus: 4 periode di lebar 400 (jadi geser 25% = tepat satu periode).
  function gelombang(isi, garis) {
    let d = 'M0 12';
    for (let i = 0; i < 4; i++) d += ' q25 -11 50 0 t50 0';
    return svg('svg', { viewBox: '0 0 400 24', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' },
      svg('path', { d: d + ' V24 H0 Z', fill: isi }),
      garis ? svg('path', { d, fill: 'none', stroke: garis, 'stroke-width': 2.5, 'vector-effect': 'non-scaling-stroke' }) : null);
  }

  const CSS = `
.play[data-game="apung"] .ap-scene {
  --ys: 40%; flex: none; height: min(46dvh, 380px); min-height: 280px;
  background: linear-gradient(#bfe9ff, #eaf8ff 70%);
}
.play[data-game="apung"] .ap-scene > * { position: absolute; pointer-events: none; }
.play[data-game="apung"] .ap-matahari { right: 9%; top: 8%; width: 52px; height: 52px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #fff6b0, #ffd23f); box-shadow: 0 0 0 9px rgba(255, 210, 63, 0.25); }
.play[data-game="apung"] .ap-awan { height: 24px; border-radius: 24px; background: #fff; opacity: 0.92; }
.play[data-game="apung"] .ap-awan::before { content: ''; position: absolute; left: 22%; bottom: 8px; width: 38%; height: 130%; border-radius: 50%; background: #fff; }
.play[data-game="apung"] .ap-awan1 { left: 8%; top: 11%; width: 84px; }
.play[data-game="apung"] .ap-awan2 { left: 62%; top: 22%; width: 64px; height: 20px; }
.play[data-game="apung"] .ap-air { left: 0; right: 0; top: var(--ys); bottom: 0; background: linear-gradient(#58c4ff, #2b86ea 55%, #1f6fd6); }
.play[data-game="apung"] .ap-onde { left: 0; top: calc(var(--ys) - 12px); width: 200%; height: 24px; will-change: transform; }
.play[data-game="apung"] .ap-onde svg { display: block; width: 100%; height: 100%; }
.play[data-game="apung"] .ap-pasir {
  left: 0; right: 0; bottom: 0; height: 13%; border-radius: 60% 60% 0 0 / 14px 14px 0 0; background-color: #fcd98c;
  background-image:
    radial-gradient(ellipse 7px 4px at 14% 58%, #dcb56b 96%, transparent),
    radial-gradient(ellipse 5px 3px at 38% 40%, #e8c383 96%, transparent),
    radial-gradient(ellipse 8px 4px at 66% 62%, #dcb56b 96%, transparent),
    radial-gradient(ellipse 5px 3px at 86% 44%, #e8c383 96%, transparent);
}
.play[data-game="apung"] .ap-obj {
  left: 50%; top: 0; width: var(--sz, 64px); height: var(--sz, 64px); margin-left: calc(var(--sz, 64px) / -2);
  display: grid; place-items: center; font-size: calc(var(--sz, 64px) * 0.84); line-height: 1; will-change: transform;
}
.play[data-game="apung"] .ap-lapis { left: 0; right: 0; top: calc(var(--ys) + 12px); bottom: 0; background: rgba(40, 130, 235, 0.22); }
.play[data-game="apung"] .ap-drop { left: 0; top: 0; width: 9px; height: 9px; border-radius: 50%; background: #e3f6ff; border: 2px solid #8fd3ff; display: none; will-change: transform; }
.play[data-game="apung"] .ap-ripple { left: 50%; top: 0; width: 80px; height: 16px; margin-left: -40px; border: 3px solid rgba(255, 255, 255, 0.9); border-radius: 50%; opacity: 0; will-change: transform; }
.play[data-game="apung"] .stage > :first-child { margin-top: 0; }
.play[data-game="apung"] .ap-pilih { gap: 14px; }
.play[data-game="apung"] .ap-btn { flex-direction: column; gap: 2px; min-width: 150px; min-height: 100px; font-size: 1.35rem; }
.play[data-game="apung"] .lvl-tk .ap-btn, .lvl-tk.play[data-game="apung"] .ap-btn { min-height: 108px; font-size: 1.5rem; }
.play[data-game="apung"] .ap-ikon { font-size: 2rem; line-height: 1; }
.play[data-game="apung"] .ap-btn[aria-disabled="true"] { pointer-events: none; }
.play[data-game="apung"] .ap-btn.is-pilih { border-color: var(--c); }
.play[data-game="apung"] .ap-kartu { display: grid; place-items: center; width: auto; padding: 14px 40px; }
@media (max-width: 560px) {
  .play[data-game="apung"] .ap-btn { min-width: 146px; }
}`;

  const G = 1100, REDAM = 4.2;

  async function soalBenda(ctx, b) {
    const kurang = TI.reduced();
    ctx.ask(b.nama + ' akan terapung atau tenggelam?');

    const obj = h('div', { class: 'ap-obj', 'aria-hidden': 'true' }, b.em);
    const ombakB = h('div', { class: 'ap-onde', 'aria-hidden': 'true' }, gelombang('#8fdcff'));
    const ombakF = h('div', { class: 'ap-onde', 'aria-hidden': 'true' }, gelombang('rgba(40, 130, 235, 0.22)', 'rgba(255, 255, 255, 0.85)'));
    const ripple = h('i', { class: 'ap-ripple' });
    const tetes = Array.from({ length: 9 }, () => h('i', { class: 'ap-drop' }));
    const scene = h('div', { class: 'ti-scene ap-scene pop-in', role: 'img', 'aria-label': 'Akuarium berisi air' },
      h('div', { class: 'ap-matahari' }), h('div', { class: 'ap-awan ap-awan1' }), h('div', { class: 'ap-awan ap-awan2' }),
      h('div', { class: 'ap-air' }), ombakB, h('div', { class: 'ap-pasir' }), obj, h('div', { class: 'ap-lapis' }), ombakF, ripple, ...tetes);
    const baris = h('div', { class: 'ti-row ap-pilih' });
    ctx.el.append(scene, baris);

    // ----- ukuran dan posisi (dalam px) -----
    let W = 0, H = 0, ys = 0, r = 0, pasir = 0, y0 = 0, yEq = 0;
    function ukur() {
      W = scene.clientWidth; H = scene.clientHeight;
      const size = Math.round(Math.min(76, Math.max(54, W * 0.18)));
      scene.style.setProperty('--sz', size + 'px');
      r = size / 2; ys = H * 0.4; pasir = H * 0.87 + 6;
      y0 = r + 10;
      yEq = ys - r + 2 * r * b.rho;
    }
    ukur();
    ctx.on(window, 'resize', ukur);

    // ----- keadaan animasi -----
    let mode = 'tunggu'; // tunggu | jatuh | statis (gerak dikurangi) | diam
    let y = y0, v = 0, t = 0, masuk = false, tMasuk = 0, rot = 0;
    const rotAkhir = rand(-18, 18);
    let usiaRipple = 9;
    const hidup = [];
    let selesaiFisika = () => {};
    const berhenti = new Promise((res) => { selesaiFisika = () => { if (mode !== 'diam') { mode = 'diam'; res(); } }; });

    function percik() {
      ctx.sfx('splash');
      if (kurang) return;
      usiaRipple = 0;
      tetes.forEach((el) => {
        el.style.display = 'block';
        hidup.push({ el, x: W / 2 + rand(-r / 2, r / 2), y: ys, vx: rand(-170, 170), vy: -rand(220, 430), umur: 0.65 });
      });
    }

    function langkah(dt) {
      const f = Math.max(0, Math.min(1, (y + r - ys) / (2 * r)));
      let a = G;
      if (f > 0) {
        a = G * (1 - f / b.rho) - REDAM * v;
        if (!kurang && b.apung) a += 110 * Math.sin(t * 5.2); // riak kecil di permukaan
      }
      v += a * dt; y += v * dt;
      if (!masuk && y + r > ys) { masuk = true; tMasuk = t; percik(); }
      if (!b.apung && y + r >= pasir) { y = pasir - r; v = 0; rot = rotAkhir; selesaiFisika(); }
      if (b.apung && masuk && t - tMasuk > 0.6 && Math.abs(v) < 45 && Math.abs(y - yEq) < 8) selesaiFisika();
      if (masuk && t - tMasuk > 2.4) selesaiFisika();
    }

    /* motion-ok: benda jatuh ke air lalu mengapung atau tenggelam adalah isi permainan; gerak fisika lewat ctx.loop dan transform saja */
    const henti = ctx.loop((dt) => {
      t += dt;
      if (!kurang) {
        ombakB.style.transform = 'translate3d(' + (-((t * 0.1) % 1) * 25).toFixed(2) + '%,0,0)';
        ombakF.style.transform = 'translate3d(' + (-25 + ((t * 0.17) % 1) * 25).toFixed(2) + '%,0,0)';
      }
      if (mode === 'tunggu') {
        y = y0 + (kurang ? 0 : Math.sin(t * 2.2) * 3);
        rot = kurang ? 0 : Math.sin(t * 1.6) * 3;
      } else if (mode === 'jatuh') {
        for (let i = 0; i < 4; i++) langkah(dt / 4);
        if (!kurang && mode === 'jatuh') rot = b.apung ? (masuk ? Math.sin(t * 3.1) * 5 : 0) : Math.sin(y * 0.045) * 14;
      } else if (b.apung && !kurang) {
        // sudah seimbang: terus bergoyang pelan di permukaan
        for (let i = 0; i < 4; i++) langkah(dt / 4);
        rot = Math.sin(t * 3.1) * 5;
      }
      obj.style.transform = 'translate3d(0,' + (y - r).toFixed(1) + 'px,0) rotate(' + rot.toFixed(1) + 'deg)';

      if (usiaRipple < 0.75) {
        usiaRipple += dt;
        const s = 0.5 + (usiaRipple / 0.75) * 1.7;
        ripple.style.opacity = String(Math.max(0, 0.85 * (1 - usiaRipple / 0.75)).toFixed(2));
        ripple.style.transform = 'translate3d(0,' + (ys - 8).toFixed(1) + 'px,0) scale(' + s.toFixed(2) + ')';
      }
      for (let i = hidup.length - 1; i >= 0; i--) {
        const p = hidup[i];
        p.vy += 1300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.umur -= dt;
        if (p.umur <= 0) { p.el.style.display = 'none'; hidup.splice(i, 1); continue; }
        p.el.style.opacity = String(Math.min(1, p.umur / 0.4).toFixed(2));
        p.el.style.transform = 'translate3d(' + (p.x - 4).toFixed(1) + 'px,' + (p.y - 4).toFixed(1) + 'px,0)';
      }
    });

    // Gerak jatuh dimulai setelah anak menebak.
    function luncurkan() {
      if (kurang) {
        // gerak lebih sederhana: langsung ke posisi akhir (pelan memudar)
        mode = 'statis'; y = b.apung ? yEq : pasir - r; rot = 0;
        masuk = true; percik();
        ctx.after(350, selesaiFisika);
        return;
      }
      mode = 'jatuh'; v = 0;
      ctx.after(3600, selesaiFisika); // jaga-jaga supaya tidak macet
    }

    // ----- tebakan -----
    const pilihan = [['apung', 'Terapung', '⬆️'], ['tenggelam', 'Tenggelam', '⬇️']];
    const tombol = [];
    const jawab = await new Promise((resolve) => {
      let kunci = false;
      pilihan.forEach(([id, teks, ikon], i) => {
        const btn = h('button', { type: 'button', class: 'choice ap-btn pop-in', style: '--i:' + i, 'aria-label': teks },
          h('span', { class: 'ap-ikon', 'aria-hidden': 'true' }, ikon), h('span', null, teks));
        btn._id = id;
        btn.addEventListener('click', () => { if (kunci) return; kunci = true; resolve({ id, btn }); });
        tombol.push(btn);
        baris.append(btn);
      });
    });
    tombol.forEach((x) => x.setAttribute('aria-disabled', 'true'));
    jawab.btn.classList.add('is-pilih');
    ctx.sfx('whoosh');
    luncurkan();
    await berhenti;
    await ctx.wait(kurang ? 200 : 500);

    const benar = (jawab.id === 'apung') === b.apung;
    tombol.forEach((x) => { if (x._id === (b.apung ? 'apung' : 'tenggelam')) x.classList.add('is-correct'); });
    if (benar) await ctx.correct(jawab.btn, { say: false, min: 550 });
    else await ctx.wrong(jawab.btn, { say: false });
    baris.remove();
    ctx.note((benar ? 'Benar! ' : 'Hampir! ') + b.why + (ctx.isSD && b.whySD ? b.whySD : ''), { title: 'Kenapa?' });
    await ctx.next();
    henti();
  }

  async function soalKapal(ctx) {
    ctx.ask('Kapal dari besi bisa terapung karena?');
    ctx.el.append(h('div', { class: 'ti-card ap-kartu pop-in' }, h('p', { class: 'ti-big', 'aria-hidden': 'true' }, '🚢')));
    await ctx.choose({
      options: shuffle(['Bentuknya lebar dan berisi banyak udara', 'Kapalnya sangat ringan', 'Kapal didorong angin']),
      answer: 'Bentuknya lebar dan berisi banyak udara',
      layout: 'is-col',
    });
    ctx.note('Kapal besi itu lebar dan di dalamnya penuh udara, jadi seluruh kapal lebih ringan dari air dan bisa terapung.', { title: 'Kenapa?' });
    await ctx.next();
  }

  TI.register({
    id: 'apung',
    title: 'Tenggelam atau Terapung',
    cat: 'sains',
    icon: '⛵',
    desc: 'Tebak benda terapung atau tenggelam, lalu lihat percobaannya.',
    start(ctx) {
      TI.style('apung', CSS);
      const lesson = 'Benda yang lebih ringan dari air akan terapung, benda yang lebih berat akan tenggelam.';
      const apung = BENDA.filter((x) => x.apung), tenggelam = BENDA.filter((x) => !x.apung);
      if (ctx.isTK) {
        const soal = shuffle([...sample(apung, 3), ...sample(tenggelam, 3)]);
        ctx.series(soal, (b) => soalBenda(ctx, b), { lesson });
      } else {
        const telur = BENDA.find((x) => x.id === 'telur');
        const soal = shuffle([...sample(apung, 4), telur, ...sample(tenggelam.filter((x) => x !== telur), 3)]);
        ctx.series([...soal, { kapal: true }], (b) => (b.kapal ? soalKapal(ctx) : soalBenda(ctx, b)), { lesson });
      }
    },
  });
})();
