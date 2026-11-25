import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="kontak">
      <div className="site-footer-card">
        <section>
          <h3>Tumbie Posyandu</h3>
          <p>Layanan terpadu pendampingan tumbuh kembang anak, imunisasi terjadwal, dan edukasi nutrisi keluarga dengan pendekatan kasih sayang dan standar medis terkini.</p>
          <span className="partner"><ShieldCheck size={13} /> Mitra Resmi Puskesmas & Kemenkes RI</span>
        </section>
        <section>
          <h3>Kontak & Lokasi</h3>
          <ul className="contact-list">
            <li><MapPin size={14} /><span>Balai Warga RW 04, Jl. Kenanga No. 12, Kel. Melati, Jakarta Selatan</span></li>
            <li><Phone size={14} /><span>+62 812-3456-7890 (Kader Siaga)</span></li>
            <li><Mail size={14} /><span>halo@posyanduceria.id</span></li>
          </ul>
        </section>
        <section>
          <h3>Nomor Darurat Faskes</h3>
          <dl className="emergency">
            <div><dt>Puskesmas Kecamatan</dt><dd>(021) 789-0123</dd></div>
            <div><dt>IGD RSUD Terdekat</dt><dd className="red">(021) 789-9911</dd></div>
            <div><dt>Call Center Ambulans</dt><dd>119</dd></div>
          </dl>
          <p className="emergency-note">Layanan darurat terhubung langsung dengan PSC 119 terdekat.</p>
        </section>
      </div>
      <div className="site-footer-bottom">
        <span>© 2025 Posyandu Ceria. Seluruh hak cipta dilindungi undang-undang.</span>
        <span className="legal"><a href="#kontak">Kebijakan Privasi</a><a href="#kontak">Syarat & Ketentuan</a><a href="#kontak">Aksesibilitas</a></span>
      </div>
    </footer>
  );
}
