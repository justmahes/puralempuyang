import { Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => (
  <footer className="bg-ebony text-cream">
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
      <div>
        <p className="font-display text-2xl">Pura Lempuyang</p>
        <p className="mt-3 text-sm text-white/70">
          Nikmati pengalaman spiritual di Pura Lempuyang dan panorama Gate of Heaven dengan sistem pemesanan digital yang cepat dan tertata.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-gold">Kontak</h4>
        <div className="mt-4 flex flex-col gap-2 text-sm text-white/80">
          <span className="flex items-center gap-2"><Phone size={16} /> +62 811-1234-888</span>
          <span className="flex items-center gap-2"><Mail size={16} /> hello@puralempuyang.com</span>
          <span className="flex items-center gap-2"><Instagram size={16} /> @puralempuyang.official</span>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-gold">Kunjungi Kami</h4>
        <p className="mt-4 text-sm text-white/80">Jalan Pura Telaga Mas, Bunutan, Abang, Karangasem - Bali</p>
        <a
          href="https://maps.app.goo.gl/KHoXBJgp7wa9uY42A"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-full border border-gold px-4 py-2 text-sm font-medium text-gold"
        >
          Navigasi
        </a>
      </div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
  © {new Date().getFullYear()} Pura Lempuyang Luhur · Persembahan untuk perjalanan yang bermakna
</div>

  </footer>
);

export default Footer;
