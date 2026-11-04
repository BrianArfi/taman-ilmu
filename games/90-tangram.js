/* 90 Tangram Rumah. Susun keping poligon (sudah berorientasi benar, cukup pasang)
   menjadi rumah dan perahu. Tanpa wajah. TK: rumah 4 keping. SD: rumah + perahu 6 keping. */
(function () {
  const { h } = TI;

  const CSS = `
.play[data-game="tangram"] .tg-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
.play[data-game="tangram"] .tg-board { position: relative; width: min(100%, 420px); border-radius: 18px; overflow: hidden; background: #e8f6ff; box-shadow: 0 4px 0 var(--shadow); }
.play[data-game="tangram"] .tg-board svg { display: block; width: 100%; height: auto; }
.play[data-game="tangram"] .tg-slot { position: absolute; padding: 0; border: 3px dashed #9aa3b5; border-radius: 8px; background: rgba(255,255,255,0.35); cursor: pointer; touch-action: manipulation; min-height: 64px; min-width: 64px; transform: translate(-50%, -50%); }
.play[data-game="tangram"] .tg-slot.is-filled { border-style: solid; border-color: var(--good); background: none; }
.play[data-game="tangram"] .tg-slot.is-hint { outline: 4px solid var(--sun); outline-offset: 2px; }
.play[data-game="tangram"] .tg-tray { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: 100%; }
.play[data-game="tangram"] .tg-chip { width: 76px; height: 76px; min-height: 0; padding: 4px; border-radius: 14px; }
.play[data-game="tangram"] .tg-chip.is-selected { outline: 4px solid var(--c); outline-offset: 2px; }
.play[data-game="tangram"] .tg-chip svg { width: 100%; height: 100%; }
.play[data-game="tangram"] .tg-slot .tg-chip { width: 100%; height: 100%; padding: 0; border: 0; background: none; box-shadow: none; }
.play[data-game="tangram"] .tg-msg { margin: 0; min-height: 1.6em; font-weight: 800; color: var(--muted); text-align: center; }
`;

  // Keping dalam koordinat papan 320x200 (SD). TK memakai 4 keping rumah saja.
  const RUMAH = [
    { id: 'badan', label: 'Badan rumah', pts: '20,110 140,110 140,180 20,180', fill: '#ffd88a', line: '#c99a3e' },
    { id: 'atap', label: 'Atap', pts: '10,110 150,110 80,58', fill: '#ef6b6b', line: '#b83232' },
    { id: 'pintu', label: 'Pintu', pts: '67,135 93,135 93,180 67,180', fill: '#8a5a2b', line: '#5e3b17' },
    { id: 'jendela', label: 'Jendela', pts: '30,122 52,122 52,144 30,144', fill: '#fff3a0', line: '#e0a100' },
  ];
  const PERAHU = [
    { id: 'lambung', label: 'Badan perahu', pts: '200,150 300,150 280,182 220,182', fill: '#c7803d', line: '#8a5a2b' },
    { id: 'layar', label: 'Layar', pts: '248,145 248,88 296,145', fill: '#fff1b8', line: '#d9a400' },
  ];
  const LATAR = '<rect x="0" y="0" width="320" height="200" fill="#dff1ff"/>'
    + '<circle cx="272" cy="30" r="18" fill="#ffd23f"/>'
    + '<rect x="0" y="182" width="320" height="18" fill="#9be07a"/>'
    + '<rect x="150" y="182" width="170" height="18" fill="#4dabf7"/>'
    + '<path d="M160 190 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="#a5d8ff" stroke-width="2.5"/>';

  function bbox(pts) {
    const xs = [], ys = [];
    pts.split(' ').forEach((p) => { const [x, y] = p.split(',').map(Number); xs.push(x); ys.push(y); });
    const x = Math.min(...xs), y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  }
  function miniSVG(p) {
    const b = bbox(p.pts);
    const geser = p.pts.split(' ').map((q) => {
      const [x, y] = q.split(',').map(Number);
      return (x - b.x + 3) + ',' + (y - b.y + 3);
    }).join(' ');
    const NS = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', '0 0 ' + (b.w + 6) + ' ' + (b.h + 6));
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<polygon points="' + geser + '" fill="' + p.fill + '" stroke="' + p.line + '" stroke-width="2.5" stroke-linejoin="round"/>';
    return el;
  }

  TI.register({
    id: 'tangram',
    title: 'Tangram Rumah',
    cat: 'logika',
    icon: '🏠',
    desc: 'Susun keping jadi rumah dan perahu.',
    start(ctx) {
      TI.style('tangram', CSS);
      const keping = ctx.isTK ? RUMAH.slice() : RUMAH.concat(PERAHU);
      return (async () => {
        ctx.progress(0, 1);
        const hasil = await papan(keping);
        if (!ctx.alive) return;
        ctx.progress(1, 1);
        ctx.finish({
          stars: hasil === 'auto' ? 1 : hasil === 'bantu' || ctx.mistakes > 0 ? 2 : 3,
          lesson: ctx.isTK
            ? 'Keping kecil bisa disusun menjadi rumah: badan, atap, pintu, dan jendela.'
            : 'Keping kecil bisa disusun menjadi rumah dan perahu.',
        });
      })();

      function papan(keping) {
        return new Promise((selesai) => {
          ctx.clear();
          ctx.ask(ctx.isTK ? 'Ketuk keping, lalu ketuk tempatnya di gambar.' : 'Susun semua keping jadi rumah dan perahu.');
          const wrap = h('div', { class: 'tg-wrap' });
          const board = h('div', { class: 'tg-board' });
          const NS = 'http://www.w3.org/2000/svg';
          const svgEl = document.createElementNS(NS, 'svg');
          svgEl.setAttribute('viewBox', ctx.isTK ? '0 0 170 200' : '0 0 320 200');
          svgEl.setAttribute('role', 'img');
          svgEl.setAttribute('aria-label', 'Siluet rumah' + (ctx.isTK ? '' : ' dan perahu'));
          svgEl.innerHTML = LATAR + keping.map((p) =>
            '<polygon points="' + p.pts + '" fill="' + p.fill + '" opacity="0.35" stroke="' + p.line + '" stroke-width="2" stroke-dasharray="6 4"/>').join('');
          board.append(svgEl);
          const VBW = ctx.isTK ? 170 : 320, VBH = 200;
          const tray = h('div', { class: 'ti-tray tg-tray' });
          const msg = h('p', { class: 'tg-msg', 'aria-live': 'polite' }, keping.length + ' keping. Ketuk keping dulu.');
          const bantu = h('button', { type: 'button', class: 'ti-btn is-ghost ti-help' }, '💡 Bantu');
          wrap.append(board, msg, tray, bantu);
          ctx.el.append(wrap);

          let pilih = null, pasang = 0, tutup = false, mode = 'ok';
          const gagal = {};
          const slotOf = {}, chipOf = {};
          const acak = ctx.isTK ? keping.slice().reverse() : keping.slice(3).concat(keping.slice(0, 3));
          keping.forEach((p) => {
            const b = bbox(p.pts);
            const cx = (b.x + b.w / 2) / VBW * 100, cy = (b.y + b.h / 2) / VBH * 100;
            const slot = h('button', {
              type: 'button', class: 'tg-slot',
              style: 'left:' + cx.toFixed(2) + '%;top:' + cy.toFixed(2) + '%;width:max(' + (b.w / VBW * 100).toFixed(2) + '%,64px);aspect-ratio:' + b.w + '/' + b.h + ';',
              'aria-label': 'Tempat ' + p.label,
            });
            board.append(slot);
            slotOf[p.id] = slot;
          });
          acak.forEach((p) => {
            const chip = h('button', { type: 'button', class: 'choice tg-chip pop-in', 'aria-label': p.label });
            chip.append(miniSVG(p));
            chip.addEventListener('click', () => {
              if (tutup || chip.disabled) return;
              if (pilih === p.id) { pilih = null; chip.classList.remove('is-selected'); return; }
              pilih = p.id;
              Object.entries(chipOf).forEach(([id, c]) => c.classList.toggle('is-selected', id === p.id));
              ctx.sfx('tap');
              ctx.say(p.label);
            });
            tray.append(chip);
            chipOf[p.id] = chip;
          });

          function taruh(p, otomatis) {
            const chip = chipOf[p.id];
            chip.disabled = true;
            chip.classList.remove('is-selected');
            slotOf[p.id].append(chip);
            slotOf[p.id].classList.add('is-filled');
            pasang++;
            msg.textContent = p.label + ' terpasang! ' + (keping.length - pasang) + ' lagi.';
            if (otomatis) { if (mode === 'ok') mode = 'bantu'; if (otomatis === 'auto') mode = 'auto'; }
            if (pasang >= keping.length) {
              tutup = true;
              const nama = ctx.isTK ? 'rumah' : 'rumah dan perahu';
              ctx.correct(null, { say: 'Jadi ' + nama + '! Hebat!' }).then(() => selesai(mode));
            }
          }
          Object.entries(slotOf).forEach(([id, slot]) => {
            slot.addEventListener('click', async () => {
              if (tutup || !pilih) { if (!tutup) ctx.say('Pilih kepingnya dulu ya.'); return; }
              const p = keping.find((x) => x.id === pilih);
              if (id === pilih) {
                pilih = null;
                taruh(p, false);
                ctx.sfx('benar');
                await ctx.say(p.label + ' terpasang.');
              } else {
                gagal[pilih] = (gagal[pilih] || 0) + 1;
                pilih = null;
                Object.values(chipOf).forEach((c) => c.classList.remove('is-selected'));
                await ctx.wrong(slot, { say: 'Bukan di sana. Coba tempat lain.' });
                if (gagal[p.id] >= 3 && !chipOf[p.id].disabled) {
                  slotOf[p.id].classList.add('is-hint');
                  await ctx.sayWait(p.label + ' dipasang di kotak berkedip ini.');
                  slotOf[p.id].classList.remove('is-hint');
                  taruh(p, 'auto');
                }
              }
            });
          });
          bantu.addEventListener('click', async () => {
            if (tutup) return;
            ctx.sfx('tap');
            const sisa = keping.find((p) => !chipOf[p.id].disabled);
            if (!sisa) return;
            pilih = null;
            Object.values(chipOf).forEach((c) => c.classList.remove('is-selected'));
            slotOf[sisa.id].classList.add('is-hint');
            await ctx.sayWait(sisa.label + ' dipasang di kotak berkedip ini.');
            if (tutup || chipOf[sisa.id].disabled) return;
            slotOf[sisa.id].classList.remove('is-hint');
            taruh(sisa, 'bantu');
            ctx.sfx('benar');
          });
        });
      }
    },
  });
})();
