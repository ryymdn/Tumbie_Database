// Konten landing page & artikel edukasi (data contoh). Ganti dengan API/CMS saat integrasi.

export const ARTICLES = [
  {
    slug: 'panduan-menu-mpasi-bergizi',
    category: 'Nutrisi & MPASI',
    readMinutes: 4,
    date: '12 Jan 2025',
    author: 'dr. Nurul Afifah, Sp.A',
    image: '/assets/articles/mpasi.jpg',
    cardTitle: 'Panduan Menu MPASI 4 Bintang untuk Cegah Stunting pada Usia 0 sampai 9 Bulan',
    excerpt: 'Kunci utama pencegahan stunting terletak pada asupan protein hewani esensial seperti hati ayam, telur, dan ikan kembung. Simak komposisi',
    title: 'Panduan Menu MPASI Bergizi Seimbang untuk Cegah Stunting',
    lead: 'Memasuki usia 6 bulan, ASI saja tidak cukup lagi memenuhi kebutuhan energi dan zat besi Si Kecil. Pelajari komposisi MPASI 4 bintang, tekstur bertahap, dan contoh menu harian dari kader gizi posyandu.',
    reviewer: { name: 'dr. Ratna Wijaya, Sp.A', meta: '12 Mei 2025 • Terverifikasi Bidan Desa Tumbie', icon: 'stethoscope' },
    summary: {
      title: 'Ringkasan Cepat untuk Ibu & Ayah',
      icon: 'bulb',
      items: [
        'Wajib sertakan protein hewani (telur, ikan, ayam, atau hati) di setiap waktu makan untuk cegah stunting.',
        'Tambahkan lemak sehat seperti minyak zaitun, santan, atau mentega tawar guna mendukung perkembangan otak.',
        'Naikkan tekstur secara bertahap dari bubur kental (6 bulan) hingga makanan keluarga (12 bulan).',
      ],
    },
    body: [
      { type: 'h2', text: '1. Mengenal Komposisi MPASI 4 Bintang' },
      { type: 'p', text: 'Stunting terjadi akibat kekurangan gizi kronis pada 1.000 Hari Pertama Kehidupan. Untuk mencegahnya, WHO dan Kemenkes RI menganjurkan menu lengkap yang memadukan empat kelompok bahan pangan dalam satu porsi mangkuk makan Si Kecil:' },
      { type: 'cards', items: [
        { title: 'Karbohidrat (Energi)', text: 'Nasi putih, kentang, ubi jalar, atau jagung manis sebagai sumber tenaga utama.' },
        { title: 'Protein Hewani (Wajib)', text: 'Telur ayam, ikan kembung, daging sapi, atau hati ayam kaya zat besi dan zinc.' },
        { title: 'Protein Nabati & Lemak', text: 'Tahu, tempe, kacang hijau, serta lemak tambahan dari santan atau minyak kelapa.' },
        { title: 'Sayur & Buah (Secukupnya)', text: 'Wortel, bayam, labu kuning, atau alpukat sebagai pelengkap vitamin dan mineral.' },
      ] },
      { type: 'h2', text: '2. Panduan Tekstur & Porsi Sesuai Usia' },
      { type: 'p', text: 'Pemberian tekstur yang sesuai usia membantu melatih keterampilan mengunyah sekaligus memastikan kepadatan kalori mencukupi lambung bayi yang masih kecil.' },
      { type: 'table', head: ['Usia Si Kecil', 'Tekstur', 'Frekuensi & Porsi'], rows: [
        ['6–8 Bulan', 'Bubur kental, saring halus', '2–3x makan utama, 2–3 sdm naik ke 1/2 mangkuk'],
        ['9–11 Bulan', 'Cincang halus atau tim lunak', '3–4x makan utama, 1/2 – 3/4 mangkuk (250 ml)'],
        ['12–23 Bulan', 'Makanan keluarga diiris kecil', '3–4x makan utama + 1–2x selingan bergizi'],
      ] },
      { type: 'h2', text: '3. Contoh Menu Harian Anti-Stunting' },
      { type: 'p', text: 'Ibu dapat memanfaatkan bahan pangan lokal yang mudah ditemukan di pasar sekitar dengan biaya terjangkau, seperti menu **Bubur Ikan Kembung Labu Kuning** berikut:' },
      { type: 'recipe', title: 'Resep Praktis (2 Porsi • Usia 6–8 Bulan)', lines: [
        { label: 'Bahan', text: '4 sdm nasi putih, 50 gr daging ikan kembung kukus (tanpa duri), 30 gr labu kuning, 1 sdm santan segar, dan 1 sdt minyak zaitun/kelapa.' },
        { label: 'Cara Membuat', text: 'Rebus nasi bersama labu kuning hingga lunak. Masukkan ikan kembung dan santan, aduk hingga mengental. Saring sesuai tekstur usia Si Kecil, lalu tambahkan minyak zaitun sebelum disajikan hangat.' },
      ] },
    ],
  },
  {
    slug: 'panduan-jadwal-imunisasi-anak-2025',
    category: 'Imunisasi',
    readMinutes: 6,
    date: '08 Jan 2025',
    author: 'Bidan Endang Lestari, S.Tr.Keb',
    image: '/assets/articles/imunisasi.jpg',
    cardTitle: 'Jadwal Imunisasi Dasar Balita Tahun 2025: Waktu Tepat dan Cepat Tanggap',
    excerpt: 'Memahami jadwal pemberian PCV dan Rotavirus terbaru dari Kemenkes serta cara tepat mengatasi KIPI (reaksi demam ringan setelah imunisasi).',
    title: 'Panduan Jadwal Imunisasi Anak 2025: Lengkap Berdasarkan IDAI, WHO, dan Kemenkes RI',
    lead: 'Hanya 56,4% anak usia 12–23 bulan di Indonesia yang mendapatkan imunisasi lengkap. Temukan jadwal imunisasi anak terlengkap 2025 berdasarkan rekomendasi IDAI, WHO, dan Kemenkes RI — dari lahir hingga usia 18 tahun, lengkap dengan tips praktis untuk orang tua.',
    reviewer: { name: 'dr. Ratna Wijaya, Sp.A', meta: '12 Mei 2025 • Terverifikasi Bidan Desa Tumbie', icon: 'stethoscope' },
    summary: {
      title: 'Ringkasan Cepat untuk Ibu & Ayah',
      icon: 'bulb',
      items: [
        'Imunisasi membantu melindungi anak dari penyakit menular berbahaya.',
        'Vaksin dapat mencegah penyakit seperti TBC, polio, hepatitis B, campak, dan difteri.',
        'Pemberian imunisasi perlu mengikuti jadwal sesuai usia anak.',
        'Jika jadwal terlewat, orang tua dapat berkonsultasi untuk melakukan imunisasi kejar.',
      ],
    },
    body: [
      { type: 'h2', text: '1. Mengapa Imunisasi Penting?' },
      { type: 'p', text: 'Imunisasi merupakan salah satu langkah penting untuk menjaga kesehatan dan melindungi anak sejak usia dini. Melalui pemberian vaksin, tubuh anak diperkenalkan pada antigen tertentu sehingga sistem kekebalan tubuh dapat mengenali dan membentuk perlindungan terhadap penyakit.' },
      { type: 'p', text: 'Menurut WHO, vaksinasi dapat mencegah sekitar 3,5–5 juta kematian setiap tahunnya akibat berbagai penyakit menular. Oleh karena itu, pemberian imunisasi secara lengkap dan sesuai jadwal sangat dianjurkan untuk mendukung pertumbuhan serta kesehatan anak.' },
      { type: 'cards', items: [
        { title: 'Melindungi dari Penyakit Berbahaya', text: 'Imunisasi membantu melindungi anak dari berbagai penyakit menular, seperti tuberkulosis (TBC), hepatitis B, polio, difteri, tetanus, pertusis, dan campak yang dapat menyebabkan komplikasi serius.' },
        { title: 'Meningkatkan Sistem Kekebalan Tubuh', text: 'Vaksin membantu sistem kekebalan tubuh mengenali kuman penyebab penyakit. Dengan demikian, tubuh dapat memberikan respons perlindungan ketika suatu saat terpapar penyakit tersebut.' },
        { title: 'Mengurangi Risiko Komplikasi Penyakit', text: 'Anak yang mendapatkan imunisasi sesuai jadwal memiliki perlindungan terhadap penyakit sasaran vaksin, sehingga risiko mengalami dampak berat dan komplikasi dapat dikurangi.' },
        { title: 'Mendukung Tumbuh Kembang Anak', text: 'Dengan mengurangi risiko penyakit yang dapat dicegah melalui vaksinasi, anak memiliki kesempatan lebih baik untuk menjalani aktivitas, belajar, dan tumbuh secara optimal.' },
      ] },
      { type: 'h2', text: '2. Panduan Jadwal Imunisasi Sesuai Usia' },
      { type: 'p', text: 'Pemberian imunisasi dilakukan secara bertahap sesuai perkembangan usia anak.' },
      { type: 'table', head: ['Usia Anak', 'Jenis Vaksin', 'Manfaat Perlindungan'], rows: [
        ['Saat lahir', 'HB-0, BCG, OPV-0', 'Hepatitis B, TBC berat, dan Polio'],
        ['2 Bulan', 'DTP-HB-Hib 1, OPV 1, PCV 1, Rotavirus 1', 'Difteri, Pertusis, Tetanus, Hepatitis B, infeksi Hib, Polio, Pneumonia pneumokokus, dan Diare Rotavirus'],
        ['3 Bulan', 'DTP-HB-Hib 2, OPV 2, Rotavirus 2', 'Difteri, Pertusis, Tetanus, Hepatitis B, infeksi Hib, Polio, dan Diare Rotavirus'],
        ['4 Bulan', 'DTP-HB-Hib 3, OPV 3, IPV 1, PCV 2', 'Difteri, Pertusis, Tetanus, Hepatitis B, infeksi Hib, Polio, dan penyakit pneumokokus'],
        ['6 Bulan', 'Influenza 1, PCV 3', 'Influenza dan penyakit pneumokokus'],
        ['9 Bulan', 'MR 1, JE (daerah endemis)', 'Campak, Rubela, dan Japanese Encephalitis'],
      ] },
      { type: 'h2', text: '3. Perawatan Anak Setelah Imunisasi' },
      { type: 'p', text: 'Setelah mendapatkan imunisasi, anak mungkin mengalami beberapa reaksi ringan seperti demam, kemerahan, pembengkakan, atau nyeri pada area bekas suntikan. Kondisi ini umumnya merupakan respons normal tubuh dalam membentuk kekebalan terhadap penyakit tertentu.' },
      { type: 'p', text: 'Orang tua dianjurkan untuk tetap memberikan ASI atau cairan yang cukup sesuai usia anak agar kebutuhan cairannya terpenuhi. Jika anak mengalami demam, pantau suhu tubuh secara berkala dan berikan kenyamanan dengan pakaian yang tidak terlalu tebal. Area bekas suntikan dapat dikompres dingin apabila terasa nyeri atau mengalami pembengkakan.' },
      { type: 'p', text: 'Selama masa pemulihan, pastikan anak mendapatkan waktu istirahat yang cukup. Orang tua juga perlu memperhatikan perubahan kondisi anak setelah imunisasi. Apabila muncul reaksi berat, seperti kesulitan bernapas, pembengkakan pada wajah, atau kondisi yang mengkhawatirkan, segera bawa anak ke fasilitas kesehatan.' },
      { type: 'recipe', title: 'Bagaimana Jika Jadwal Imunisasi Terlewat?', lines: [
        { text: 'Jangan khawatir jika anak melewatkan jadwal imunisasi. Imunisasi kejar dapat dilakukan dengan bantuan dokter atau petugas kesehatan. Segera periksa riwayat vaksinasi anak melalui Buku KIA untuk menentukan jadwal selanjutnya.', strong: true },
      ] },
    ],
  },
  {
    slug: 'milestone-motorik-balita-1-2-tahun',
    category: 'Stimulasi Balita',
    readMinutes: 5,
    date: '02 Jan 2025',
    author: 'Fisioterapis Anak Rina Wijaya',
    image: '/assets/articles/stimulasi.jpg',
    cardTitle: 'Milestone Motorik Kasar & Halus Balita Usia 1–2 Tahun: Kapan Harus Waspada?',
    excerpt: 'Panduan praktis melatih koordinasi tangan-mata, keseimbangan berjalan, serta mengenali tanda bahaya (red flags) keterlambatan bicara...',
    title: 'Milestone Motorik Kasar & Halus Balita Usia 1–2 Tahun',
    lead: 'Pada rentang usia 12 hingga 24 bulan, Si Kecil mulai aktif berjalan, memanjat, dan menyusun balok. Ketahui cara stimulasi harian di rumah serta tanda keterlambatan yang perlu dipantau.',
    reviewer: { name: 'dr. Hendra Saputra, Sp.A', meta: '08 Mei 2025 • Klinik Tumbuh Kembang Tumbie', icon: 'pulse', share: true },
    summary: {
      title: 'Ringkasan Tahapan Usia 1–2 Tahun',
      icon: 'steps',
      items: [
        'Motorik kasar: berdiri mandiri, berjalan lancar di usia 15–18 bulan, hingga mulai berlari kecil di usia 2 tahun.',
        'Motorik halus: menyusun 3–4 balok, memegang sendok sendiri, dan mencoret kertas dengan krayon.',
        'Stimulasi terbaik dilakukan lewat permainan bebas aman tanpa gawai selama 30–60 menit per hari.',
      ],
    },
    body: [
      { type: 'h2', text: '1. Target Motorik Kasar vs. Motorik Halus' },
      { type: 'p', text: 'Memahami kedua aspek motorik membantu orang tua mengamati perkembangan keseimbangan otot besar sekaligus ketangkasan jari-jemari Si Kecil secara seimbang:' },
      { type: 'cards', columns: 2, items: [
        { title: 'Motorik Kasar', list: ['Berjalan tanpa bantuan (12–15 bulan)', 'Membungkuk lalu berdiri kembali', 'Menendang bola ke depan (18–24 bulan)'] },
        { title: 'Motorik Halus', list: ['Menjepit benda kecil (pincer grasp)', 'Membalik halaman buku karton tebal', 'Menyusun menara 4–6 balok kayu'] },
      ] },
      { type: 'h2', text: '2. Aktivitas Stimulasi Harian di Rumah' },
      { type: 'p', text: 'Tidak perlu mainan mahal untuk melatih keterampilan balita. Ibu dan Ayah dapat mengajak Si Kecil bermain lempar-tangkap bola lunak di halaman, memindahkan pom-pom warna ke wadah mangkuk dengan tangan, atau menari mengikuti irama lagu anak.' },
      { type: 'h2', text: '3. Kapan Perlu Konsultasi ke Posyandu atau Dokter?' },
      { type: 'p', text: 'Setiap anak memiliki laju tumbuh kembang yang unik. Namun, segera periksakan Si Kecil ke Posyandu atau dokter anak bila di usia **18 bulan belum mampu berjalan mandiri**, tampak kaku atau lemas pada satu sisi tubuh, atau kehilangan kemampuan yang sebelumnya sudah dikuasai.' },
    ],
  },
];

export const getArticle = (slug) => ARTICLES.find((a) => a.slug === slug);

export const SERVICES = [
  { icon: 'scale', title: 'Penimbangan & Antropometri', tag: 'KMS Digital', text: 'Deteksi dini stunting dan wasting melalui penimbangan digital, pengukuran panjang badan/tinggi, serta lingkar kepala berkala.' },
  { icon: 'syringe', title: 'Imunisasi Dasar Lengkap', tag: 'Kemenkes IDAI', text: 'Pemberian vaksin BCG, Polio tetes/suntik, DPT-HB-Hib, PCV, Rotavirus, hingga Campak-Rubella sesuai jadwal IDAI dan Kemenkes RI.' },
  { icon: 'pill', title: 'Vitamin A & Obat Cacing', tag: 'Gratis Nasional', text: 'Pemberian kapsul Vitamin A biru/merah pada Bulan Vitamin A (Februari & Agustus) serta obat cacing pencegah malnutrisi.' },
];

export const STATS = [
  { label: 'DATA BALITA', value: '40+', note: 'Terpantau di 3 pos RW' },
  { label: 'CAKUPAN VAKSIN', value: '98.4%', note: 'Imunisasi dasar lengkap' },
  { label: 'KADER SIAGA', value: '15 Kader', note: 'Sertifikasi Kemenkes' },
  { label: 'BEBAS STUNTING', value: '0 Kasus', note: 'Keluarga binaan 2025–2026' },
];

export const TESTIMONIALS = [
  { name: 'Ibu Anisa Paramitha', role: 'Mama dari Adik Dika (14 Bulan)', quote: 'Dulu selalu bingung memantau kurva KMS di buku kertas yang gampang basah. Sejak ada KMS online di Posyandu Ceria, grafik berat badan Dika langsung terlihat jelas di WhatsApp saya. Kader-kadernya juga sangat ramah dan sabar.' },
  { name: 'Ibu Desi Ratnasari', role: 'Mama dari Adik Alika (9 Bulan)', quote: 'Resep MPASI yang dibagikan ahli gizi di sini ampuh banget buat anak saya yang sempat GTM (gerakan tutup mulut). Rekomendasi protein hewani lokal sangat masuk akal dan praktis dibuat di rumah.' },
  { name: 'Bapak Hendra Pratama', role: 'Papa dari Adik Kenzo (2 Tahun)', quote: 'Saya sebagai ayah sering mengantar anak timbang bulanan. Antreannya tertib, pengingat WhatsApp selalu masuk H-2 sebelum hari posyandu. Pelayanan kesehatan masyarakat rasa klinik modern!' },
];
