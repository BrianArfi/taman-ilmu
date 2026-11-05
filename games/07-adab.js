/* 07 Ucapan & Adab Baik. Soal situasi dengan ikon benda besar, anak memilih ucapan atau perbuatan yang benar.
   Semua soal dan arti ucapan diambil persis dari SPEC.md bagian 6. Tidak ada teks Arab di game ini. */
(function () {
  const { h, shuffle, sample } = TI;

  // tk: true = boleh keluar di jenjang TK. x = pengecoh.
  const BANK = [
    { q: 'Sebelum makan, kita membaca?', a: 'Bismillah', x: ['Alhamdulillah', 'Astaghfirullah'], ic: '🍚', tk: true },
    { q: 'Selesai makan, kita mengucap?', a: 'Alhamdulillah', x: ['Bismillah', 'Insya Allah'], ic: '🍽️', tk: true },
    { q: 'Masuk rumah atau bertemu teman, kita mengucap?', a: "Assalamu'alaikum", x: ['Alhamdulillah', 'Masya Allah'], ic: '🏠', tk: true },
    { q: 'Ada yang mengucap salam, kita menjawab?', a: "Wa'alaikumussalam", x: ['Bismillah', 'Subhanallah'], ic: '👋', tk: true },
    { q: 'Makan dan minum memakai tangan?', a: 'Tangan kanan', x: ['Tangan kiri', 'Dua kaki'], ic: '🥛', tk: true },
    { q: 'Teman jatuh dan menangis, kita sebaiknya?', a: 'Menolong dan menghiburnya', x: ['Menertawakannya', 'Pergi saja'], ic: '🩹', tk: true },
    { q: 'Ada sampah di lantai, kita sebaiknya?', a: 'Membuangnya ke tempat sampah', x: ['Membiarkannya', 'Menendangnya'], ic: '🗑️', tk: true },
    { q: 'Setelah bersin, kita mengucap?', a: 'Alhamdulillah', x: ['Astaghfirullah', 'Bismillah'], ic: '💨' },
    { q: 'Teman bersin lalu mengucap Alhamdulillah, kita menjawab?', a: 'Yarhamukallah', x: ['Masya Allah', 'Insya Allah'], ic: '💬' },
    { q: 'Melihat pelangi yang indah, kita mengucap?', a: 'Masya Allah', x: ['Astaghfirullah', 'Innalillahi'], ic: '🌈' },
    { q: 'Berjanji akan datang besok, kita mengucap?', a: 'Insya Allah', x: ['Alhamdulillah', 'Masya Allah'], ic: '📅' },
    { q: 'Tidak sengaja berbuat salah, kita mengucap?', a: 'Astaghfirullah', x: ['Alhamdulillah', 'Insya Allah'], ic: '💭' },
    { q: 'Masuk masjid mendahulukan kaki?', a: 'Kaki kanan', x: ['Kaki kiri'], ic: '🕌' },
    { q: 'Masuk kamar mandi mendahulukan kaki?', a: 'Kaki kiri', x: ['Kaki kanan'], ic: '🚿' },
    { q: 'Orang tua memanggil, kita sebaiknya?', a: 'Segera datang dan menjawab dengan sopan', x: ['Pura-pura tidak dengar', 'Menjawab sambil marah'], ic: '📣' },
    { q: 'Teman memberi hadiah, kita mengucap?', a: 'Jazakallahu khairan', x: ['Astaghfirullah', 'Innalillahi'], ic: '🎁' },
  ];

  // Arti ucapan (hanya untuk jawaban yang berupa ucapan).
  const ARTI = {
    Bismillah: 'Dengan nama Allah',
    Alhamdulillah: 'Segala puji bagi Allah',
    "Assalamu'alaikum": 'Semoga keselamatan untukmu',
    "Wa'alaikumussalam": 'Semoga keselamatan juga untukmu',
    Yarhamukallah: 'Semoga Allah merahmatimu',
    'Masya Allah': 'Atas kehendak Allah',
    'Insya Allah': 'Jika Allah menghendaki',
    Astaghfirullah: 'Aku mohon ampun kepada Allah',
    'Jazakallahu khairan': 'Semoga Allah membalasmu dengan kebaikan',
  };
  const kecil = (s) => s.charAt(0).toLowerCase() + s.slice(1);

  const CSS = `
.play[data-game="adab"] .adab-card {
  display: grid; place-items: center; flex: none; width: 164px; height: 148px; border-radius: 36px;
  background: radial-gradient(circle at 30% 24%, #fff 0, color-mix(in srgb, var(--c) 14%, #fff) 100%);
  border: 4px solid color-mix(in srgb, var(--c) 28%, #fff); box-shadow: 0 6px 0 var(--shadow);
}
.play[data-game="adab"].lvl-tk .adab-card { width: 188px; height: 168px; }
.play[data-game="adab"] .adab-ic { font-size: 4.6rem; line-height: 1; }
.play[data-game="adab"].lvl-tk .adab-ic { font-size: 5.4rem; }
.play[data-game="adab"] .ti-choices.is-col { max-width: 560px; }
.play[data-game="adab"] .ti-choices.is-col .choice { min-height: 72px; }
.play[data-game="adab"].lvl-tk .ti-choices.is-col .choice { min-height: 84px; }
.play[data-game="adab"] .ti-choices.is-done .choice:disabled { display: none; }
@media (max-height: 820px) {
  .play[data-game="adab"] .adab-card, .play[data-game="adab"].lvl-tk .adab-card { width: 132px; height: 112px; border-radius: 28px; }
  .play[data-game="adab"] .adab-ic, .play[data-game="adab"].lvl-tk .adab-ic { font-size: 3.6rem; }
  .play[data-game="adab"] .ti-choices.is-col .choice, .play[data-game="adab"].lvl-tk .ti-choices.is-col .choice { min-height: 68px; }
}
@media (max-width: 560px) {
  .play[data-game="adab"] .adab-card { width: 132px; height: 116px; border-radius: 30px; }
  .play[data-game="adab"].lvl-tk .adab-card { width: 150px; height: 130px; }
  .play[data-game="adab"] .adab-ic { font-size: 3.7rem; }
  .play[data-game="adab"].lvl-tk .adab-ic { font-size: 4.2rem; }
}`;

  TI.register({
    id: 'adab',
    title: 'Ucapan & Adab Baik',
    cat: 'islam',
    icon: '🤲',
    desc: 'Kapan kita mengucap Bismillah, Alhamdulillah, dan salam? Pilih yang benar.',
    start(ctx) {
      TI.style('adab', CSS);
      // TK: 7 soal dari soal TK. SD: 8 soal acak dari semua.
      const soal = ctx.isTK ? BANK.filter((b) => b.tk) : sample(BANK, 8).map((s) => Object.assign({ sulit: s.tk ? 0 : 1 }, s)).sort((a, b) => a.sulit - b.sulit); // gampang dulu

      let ke = 0; return ctx.series(soal, async (s) => {
        ke++; if (ke === 4) ctx.correct(null, { say: ctx.isTK ? 'Bagus! Setengah jalan!' : 'Bagus! Terus naik ke yang sulit.' }); ctx.ask(s.q);
        ctx.el.append(h('div', { class: 'adab-card pop-in', 'aria-hidden': 'true' }, h('span', { class: 'adab-ic' }, s.ic))); ctx.sfx('pop');
        await ctx.choose({
          options: shuffle([s.a, ...s.x]),
          answer: s.a,
          layout: 'is-col',
        });
        // Ucapan: tampilkan dan bacakan artinya. Perbuatan: langsung lanjut.
        const arti = ARTI[s.a];
        if (arti) {
          const pilihan = ctx.el.querySelector('.ti-choices');
          if (pilihan) pilihan.classList.add('is-done'); // sembunyikan pilihan yang salah supaya artinya muat di layar
          ctx.note('"' + s.a + '" berarti ' + kecil(arti) + '.', { title: 'Artinya:' });
          ctx.sfx('pop'); await ctx.next();
        }
      }, {
        lesson: 'Anak shalih membiasakan ucapan baik dan adab yang baik setiap hari.',
      });
    },
  });
})();
