// Kerangka halaman autentikasi orang tua: foto latar + kartu putih berisi logo dan konten.
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <main className="auth-card">
        <img className="auth-logo" src="/assets/tumbie-logo.png" alt="Tumbie" />
        {children}
      </main>
    </div>
  );
}
