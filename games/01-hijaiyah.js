/* 01 Tebak Huruf Hijaiyah. Game contoh: pola dasar ctx.series + ctx.choose. */
(function () {
  const { h, shuffle, sample } = TI;

  // 28 huruf hijaiyah dengan nama ala TPA. Dua "Ha" (ح dan ه) tidak boleh muncul di soal yang sama.
  const HURUF = [
    ['ا', 'Alif'], ['ب', 'Ba'], ['ت', 'Ta'], ['ث', 'Tsa'], ['ج', 'Jim'], ['ح', 'Ha'], ['خ', 'Kho'],
    ['د', 'Dal'], ['ذ', 'Dzal'], ['ر', 'Ro'], ['ز', 'Zai'], ['س', 'Sin'], ['ش', 'Syin'], ['ص', 'Shod'],
    ['ض', 'Dhod'], ['ط', 'Tho'], ['ظ', 'Zho'], ['ع', "'Ain"], ['غ', 'Ghoin'], ['ف', 'Fa'], ['ق', 'Qof'],
    ['ك', 'Kaf'], ['ل', 'Lam'], ['م', 'Mim'], ['ن', 'Nun'], ['و', 'Wau'], ['ه', 'Ha'], ['ي', 'Ya'],
  ].map(([ar, nama], i) => ({ ar, nama, no: i + 1 }));

  // Pengecoh: nama berbeda dari jawaban (otomatis menyingkirkan pasangan ح / ه).
  function pengecoh(target, n) {
    return sample(HURUF.filter((x) => x.nama !== target.nama), n);
  }
  const hurufNode = (x) => h('span', { class: 'ti-arabic' }, x.ar);

  TI.register({
    id: 'hijaiyah',
    title: 'Tebak Huruf Hijaiyah',
    cat: 'islam',
    icon: 'ب',
    desc: 'Kenali huruf Alif sampai Ya, bekal membaca Al-Qur\'an.',
    start(ctx) {
      const jumlah = ctx.isTK ? 8 : 10;
      const nOpsi = ctx.isTK ? 3 : 4;
      const soal = sample(HURUF, jumlah).map((t, i) => ({ t, tipe: ctx.isTK || i % 2 === 0 ? 'dengar' : 'lihat' }));

      ctx.series(soal, async ({ t, tipe }) => {
        const opsi = shuffle([t, ...pengecoh(t, nOpsi - 1)]);
        if (tipe === 'dengar') {
          // Dengar nama, pilih hurufnya.
          ctx.ask('Mana huruf ' + t.nama + '?');
          await ctx.choose({
            options: opsi.map((x) => ({ node: hurufNode(x), value: x.no, say: x.nama, aria: 'Huruf ' + x.nama, cls: 'is-big' })),
            answer: t.no,
            speakLabel: true,
          });
        } else {
          // Lihat huruf, pilih namanya.
          ctx.ask('Huruf apa ini?');
          ctx.el.append(h('div', { class: 'ti-card pop-in' }, h('p', { class: 'ti-big ti-arabic' }, t.ar)));
          await ctx.choose({ options: opsi.map((x) => ({ label: x.nama, value: x.no })), answer: t.no, speakLabel: true });
        }
      }, {
        lesson: 'Huruf hijaiyah ada 28, dari Alif sampai Ya. Huruf Al-Qur\'an dibaca dari kanan ke kiri.',
      });
    },
  });
})();
