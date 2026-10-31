/* 05 Kuis Kisah Nabi. Tanpa gambar orang: tiap soal punya ikon petunjuk berupa benda.
   Setelah jawaban benar: kotak "Kisahnya" + tombol Lanjut. */
(function () {
  const { h, shuffle, sample } = TI;

  // Bank soal persis dari SPEC. Urutan baris penting: TK memakai 7 soal pertama + soal Al-Qur'an.
  const BANK = [
    { q: 'Siapa manusia pertama yang diciptakan Allah?', a: 'Nabi Adam', w: ['Nabi Nuh', 'Nabi Musa'], icon: '🌍',
      fakta: "Nabi Adam 'alaihis salam adalah manusia pertama dan nabi pertama." },
    { q: 'Nabi yang membuat kapal besar sebelum datang banjir besar?', a: 'Nabi Nuh', w: ['Nabi Yunus', 'Nabi Ibrahim'], icon: '🚢',
      fakta: 'Kapal Nabi Nuh membawa orang-orang beriman dan hewan berpasang-pasangan.' },
    { q: 'Nabi yang tidak terbakar ketika dilempar ke dalam api?', a: 'Nabi Ibrahim', w: ['Nabi Isa', 'Nabi Daud'], icon: '🔥',
      fakta: 'Allah membuat api menjadi dingin dan menyelamatkan Nabi Ibrahim.' },
    { q: 'Nabi yang memukulkan tongkatnya hingga laut terbelah?', a: 'Nabi Musa', w: ['Nabi Nuh', 'Nabi Sulaiman'], icon: '🌊',
      fakta: 'Atas izin Allah laut terbelah, Nabi Musa dan kaumnya selamat menyeberang.' },
    { q: 'Nabi yang ditelan ikan besar lalu berdoa memohon ampun?', a: 'Nabi Yunus', w: ['Nabi Ayyub', 'Nabi Yusuf'], icon: '🤲',
      fakta: 'Nabi Yunus terus berdoa di dalam perut ikan, lalu Allah menyelamatkannya.' },
    { q: 'Nabi yang bisa mengerti bahasa hewan, bahkan semut?', a: 'Nabi Sulaiman', w: ['Nabi Daud', 'Nabi Ismail'], icon: '👑',
      fakta: 'Nabi Sulaiman mendengar semut berbicara, lalu tersenyum dan bersyukur kepada Allah.' },
    { q: 'Nabi yang menerima kitab Zabur?', a: 'Nabi Daud', w: ['Nabi Musa', 'Nabi Isa'], icon: '📖',
      fakta: 'Nabi Daud juga pandai membuat baju besi.' },
    { q: 'Nabi yang menerima kitab Taurat?', a: 'Nabi Musa', w: ['Nabi Daud', 'Nabi Isa'], icon: '📖',
      fakta: 'Taurat diturunkan kepada Nabi Musa untuk Bani Israil.' },
    { q: 'Nabi yang menerima kitab Injil?', a: 'Nabi Isa', w: ['Nabi Musa', 'Nabi Daud'], icon: '📖',
      fakta: 'Nabi Isa atas izin Allah bisa berbicara ketika masih bayi.' },
    { q: "Nabi terakhir yang menerima Al-Qur'an?", a: 'Nabi Muhammad', w: ['Nabi Isa', 'Nabi Ibrahim'], icon: '📗', quran: true,
      fakta: "Nabi Muhammad Shallallahu 'alaihi wa sallam lahir di kota Makkah. Beliau adalah nabi terakhir." },
    { q: 'Nabi yang sangat sabar walaupun sakit lama?', a: 'Nabi Ayyub', w: ['Nabi Yunus', 'Nabi Hud'], icon: '🌱',
      fakta: 'Nabi Ayyub tetap sabar dan bersyukur, lalu Allah menyembuhkannya.' },
    { q: 'Nabi yang bermimpi melihat 11 bintang, matahari, dan bulan?', a: 'Nabi Yusuf', w: ["Nabi Ya'qub", 'Nabi Yunus'], icon: '⭐',
      fakta: 'Nabi Yusuf kelak menjadi pemimpin yang jujur di negeri Mesir.' },
    { q: "Nabi yang membangun Ka'bah bersama ayahnya, Nabi Ibrahim?", a: 'Nabi Ismail', w: ['Nabi Ishaq', "Nabi Ya'qub"], icon: '🕋',
      fakta: "Nabi Ibrahim dan Nabi Ismail membangun Ka'bah di kota Makkah." },
    { q: 'Nabi yang diberi mukjizat seekor unta betina untuk kaum Tsamud?', a: 'Nabi Shalih', w: ['Nabi Hud', 'Nabi Luth'], icon: '🪨',
      fakta: 'Unta betina itu mukjizat dari Allah. Kaum Tsamud dilarang mengganggunya.' },
    { q: "Nabi yang diutus kepada kaum 'Aad?", a: 'Nabi Hud', w: ['Nabi Shalih', 'Nabi Nuh'], icon: '🌬️',
      fakta: "Kaum 'Aad yang sombong tidak mau beriman kepada Allah." },
    { q: 'Siapa ayah Nabi Yusuf?', a: "Nabi Ya'qub", w: ['Nabi Ishaq', 'Nabi Ibrahim'], icon: '🏠',
      fakta: "Nabi Ya'qub sangat sayang kepada Nabi Yusuf." },
    { q: "Nabi Muhammad Shallallahu 'alaihi wa sallam lahir di kota?", a: 'Makkah', w: ['Madinah', 'Mesir'], icon: '🏙️',
      fakta: "Kota Makkah adalah tempat Ka'bah berada." },
    { q: 'Ada berapa nabi dan rasul yang wajib kita ketahui?', a: '25', w: ['10', '99'], icon: '📜',
      fakta: "Ada 25 nabi dan rasul yang namanya disebut dalam Al-Qur'an, dari Nabi Adam sampai Nabi Muhammad Shallallahu 'alaihi wa sallam." },
  ];

  const LESSON = 'Para nabi adalah teladan. Mereka sabar, jujur, dan selalu taat kepada Allah.';

  const CSS = `
    & .nb-kartu { width: 100%; max-width: 520px; padding: 14px 18px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; background: #fffdf5; }
    & .nb-ikon { font-size: clamp(4rem, 18vw, 6.4rem); line-height: 1.05; }
    & .lvl-sd .nb-ikon { font-size: clamp(3.4rem, 15vw, 5rem); }
    & .nb-jawab { margin: 0; padding: 6px 20px; border-radius: 999px; background: var(--good-bg); border: 3px solid var(--good); color: #0a6b49; font-size: 1.35rem; font-weight: 800; animation: nb-muncul var(--dur-ui) var(--ease-out) both; }
    @keyframes nb-muncul { from { opacity: 0; transform: scale(0.95); } }
    & .nb-pilihan { max-width: 560px; }
    @media (max-width: 560px) {
      & .nb-pilihan .choice { min-height: 72px; }
    }
    @media (prefers-reduced-motion: reduce) {
      & .nb-jawab { animation-name: ti-fade; }
    }
  `.replace(/&/g, '.play[data-game="nabi"]');

  TI.register({
    id: 'nabi',
    title: 'Kuis Kisah Nabi',
    cat: 'islam',
    icon: '📜',
    desc: 'Tebak nabi dari kisahnya, lalu dengarkan ceritanya.',
    start(ctx) {
      TI.style('nabi', CSS);
      let soal;
      if (ctx.isTK) {
        // 7 soal pertama + soal Al-Qur'an: 5 acak dari 7 soal pertama, ditambah soal Nabi Muhammad.
        soal = shuffle([...sample(BANK.slice(0, 7), 5), BANK.find((x) => x.quran)]);
      } else {
        soal = sample(BANK, 8);
      }
      return ctx.series(soal, async (s, i) => {
        ctx.ask(s.q);
        const kartu = h('div', { class: 'ti-card nb-kartu pop-in' }, h('div', { class: 'nb-ikon', 'aria-hidden': 'true' }, s.icon));
        const pilihan = h('div', { class: 'ti-choices is-col nb-pilihan' });
        ctx.el.append(kartu, pilihan);
        await ctx.choose({
          options: shuffle([s.a, ...s.w]).map((t) => ({ label: t, value: t })),
          answer: s.a,
          into: pilihan,
        });
        if (!ctx.alive) return;
        // Pilihan diganti jawaban benar supaya kisahnya muat di layar HP.
        pilihan.remove();
        kartu.append(h('p', { class: 'nb-jawab' }, s.a));
        ctx.note(s.fakta, { title: 'Kisahnya' });
        await ctx.next(i === soal.length - 1 ? 'Selesai' : 'Lanjut');
      }, { lesson: LESSON });
    },
  });
})();
