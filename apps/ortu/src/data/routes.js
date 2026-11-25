// Daftar rute portal orang tua.
export const PATHS = {
  landing: '/',
  home: '/beranda',
  login: '/masuk',
  register: '/daftar',
  forgot: '/lupa-sandi',
  children: '/data-anak',
  addChild: '/data-anak/tambah',
  schedule: '/jadwal-posyandu',
  history: '/riwayat-pemeriksaan',
  profile: '/profil',
  article: '/artikel/:slug',
};

export const articlePath = (slug) => `/artikel/${slug}`;
