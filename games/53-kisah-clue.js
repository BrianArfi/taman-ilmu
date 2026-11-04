/* 53 Tebak Nabi dari Petunjuk. Tiap soal 3 petunjuk bertahap tentang satu nabi.
   Fakta dipakai ulang dari 05-nabi.js, tidak ada fakta baru. Tanpa gambar orang. */
(function () {
  const { h, shuffle, sample } = TI;

  // Disalin dari 05-nabi.js (hanya baris yang jawabannya nabi).
  const BANK = [
    { a: 'Nabi Adam', q: 'Siapa manusia pertama yang diciptakan Allah?', icon: '🌍',
      fakta: "Nabi Adam 'alaihis salam adalah manusia pertama dan nabi pertama." },
    { a: 'Nabi Nuh', q: 'Nabi yang membuat kapal besar sebelum datang banjir besar?', icon: '🚢',
      fakta: 'Kapal Nabi Nuh membawa orang-orang beriman dan hewan berpasang-pasangan.' },
    { a: 'Nabi Ibrahim', q: 'Nabi yang tidak terbakar ketika dilempar ke dalam api?', icon: '🔥',
      fakta: 'Allah membuat api menjadi dingin dan menyelamatkan Nabi Ibrahim.' },
    { a: 'Nabi Musa', q: 'Nabi yang memukulkan tongkatnya hingga laut terbelah?', icon: '🌊',
      fakta: 'Atas izin Allah laut terbelah, Nabi Musa dan kaumnya selamat menyeberang.' },
    { a: 'Nabi Yunus', q: 'Nabi yang ditelan ikan besar lalu berdoa memohon ampun?', icon: '🤲',
      fakta: 'Nabi Yunus terus berdoa di dalam perut ikan, lalu Allah menyelamatkannya.' },
    { a: 'Nabi Sulaiman', q: 'Nabi yang bisa mengerti bahasa hewan, bahkan semut?', icon: '👑',
      fakta: 'Nabi Sulaiman mendengar semut berbicara, lalu tersenyum dan bersyukur kepada Allah.' },
    { a: 'Nabi Daud', q: 'Nabi yang menerima kitab Zabur?', icon: '📖',
      fakta: 'Nabi Daud juga pandai membuat baju besi.' },
    { a: 'Nabi Isa', q: 'Nabi yang menerima kitab Injil?', icon: '📖',
      fakta: 'Nabi Isa atas izin Allah bisa berbicara ketika masih bayi.' },
    { a: 'Nabi Muhammad', q: "Nabi terakhir yang menerima Al-Qur'an?", icon: '📗',
      fakta: "Nabi Muhammad Shallallahu 'alaihi wa sallam lahir di kota Makkah. Beliau adalah nabi terakhir." },
    { a: 'Nabi Ayyub', q: 'Nabi yang sangat sabar walaupun sakit lama?', icon: '🌱',
      fakta: 'Nabi Ayyub tetap sabar dan bersyukur, lalu Allah menyembuhkannya.' },
    { a: 'Nabi Yusuf', q: 'Nabi yang bermimpi melihat 11 bintang, matahari, dan bulan?', icon: '⭐',
      fakta: 'Nabi Yusuf kelak menjadi pemimpin yang jujur di negeri Mesir.' },
    { a: 'Nabi Ismail', q: "Nabi yang membangun Ka'bah bersama ayahnya, Nabi Ibrahim?", icon: '🕋',
      fakta: "Nabi Ibrahim dan Nabi Ismail membangun Ka'bah di kota Makkah." },
    { a: 'Nabi Shalih', q: 'Nabi yang diberi mukjizat seekor unta betina untuk kaum Tsamud?', icon: '🪨',
      fakta: 'Unta betina itu mukjizat dari Allah. Kaum Tsamud dilarang mengganggunya.' },
    { a: 'Nabi Hud', q: "Nabi yang diutus kepada kaum 'Aad?", icon: '🌬️',
      fakta: "Kaum 'Aad yang sombong tidak mau beriman kepada Allah." },
    { a: "Nabi Ya'qub", q: 'Siapa ayah Nabi Yusuf?', icon: '🏠',
      fakta: "Nabi Ya'qub sangat sayang kepada Nabi Yusuf." },
  ];
  const NAMA = BANK.map((b) => b.a);

  const P = '.play[data-game="kisah-clue"]';
  const CSS = `
${P} .kc-clue { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 560px; }
${P} .kc-satu { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 18px; background: #fff; border: 3px solid var(--line); font-size: 1.02rem; font-weight: 600; text-align: left; box-shadow: 0 3px 0 var(--shadow); }
${P} .kc-no { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: color-mix(in srgb, var(--c) 14%, #fff); font-weight: 800; color: var(--c); }
${P} .kc-ikon { flex: none; font-size: 2.4rem; line-height: 1; }
${P} .kc-pilihan { max-width: 560px; }
${P} .kc-pilihan .choice { min-height: 64px; }`;

  // Petunjuk 3 = fakta dengan nama nabi disamarkan, jadi tetap bisa ditebak.
  const samarkan = (o) => o.fakta.split(o.a).join('Seorang nabi');

  TI.register({
    id: 'kisah-clue',
    title: 'Tebak Nabi dari Petunjuk',
    cat: 'islam',
    icon: '🗞️',
    desc: 'Tiga petunjuk, satu nabi. Siapa dia?',
    start(ctx) {
      TI.style('kisah-clue', CSS);
      const TK = ctx.isTK;
      let soal;
      if (TK) {
        const tujuh = BANK.slice(0, 7);
        const utama = sample(tujuh, 5);
        utama.push(BANK.find((x) => x.a === 'Nabi Muhammad'));
        soal = shuffle(utama);
      } else {
        soal = sample(BANK, 8);
      }
      const nOpsi = TK ? 3 : 4;

      return ctx.series(soal, async (s) => {
        ctx.ask('Perhatikan tiga petunjuk ini. Nabi siapa dia?');
        const clue = h('div', { class: 'kc-clue pop-in' },
          h('div', { class: 'kc-satu' }, h('span', { class: 'kc-no' }, '1'), h('span', { class: 'kc-ikon', 'aria-hidden': 'true' }, s.icon), h('span', null, 'Kisahnya berkaitan dengan gambar ini.')),
          h('div', { class: 'kc-satu' }, h('span', { class: 'kc-no' }, '2'), h('span', null, s.q)),
          h('div', { class: 'kc-satu' }, h('span', { class: 'kc-no' }, '3'), h('span', null, samarkan(s) + '.')));
        const pilihan = h('div', { class: 'ti-choices is-col kc-pilihan' });
        ctx.el.append(clue, pilihan);
        const lawan = shuffle(NAMA.filter((n) => n !== s.a)).slice(0, nOpsi - 1);
        await ctx.choose({
          options: shuffle([s.a, ...lawan]),
          answer: s.a,
          into: pilihan,
          speakLabel: true,
        });
        if (!ctx.alive) return;
        pilihan.remove();
        ctx.note(s.fakta, { title: 'Kisahnya' });
        await ctx.next();
      }, {
        lesson: 'Para nabi adalah teladan. Mereka sabar, jujur, dan selalu taat kepada Allah.',
      });
    },
  });
})();
