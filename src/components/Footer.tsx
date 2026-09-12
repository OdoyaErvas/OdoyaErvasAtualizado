import { Link } from "react-router-dom";
import { MessageCircle, MapPin, Leaf, Package, Truck, Clock } from "lucide-react";
import { InstagramIcon } from "./icons";
import { whatsappLink } from "../data/site";
import { useSettings } from "../store/useSettings";
import Divider from "./Divider";

export default function Footer() {
  const { storeConfig } = useSettings();
  const cfg = storeConfig;
  const phoneDisplay = cfg.whatsappPhone.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, "($1) $2 $3-$4");
  return (
    <footer className="relative overflow-hidden bg-plum-800 text-cream-100">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-plum-700/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-gold-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="Odoyá" className="h-14 w-14 rounded-full ring-1 ring-gold-400/40" />
              <div>
                <p className="font-serif text-2xl font-semibold text-cream-50">ODOYÁ</p>
                <p className="text-[0.6rem] tracking-[0.25em] text-gold-300">ERVAS DE ARUANDA</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-cream-100/70">
              Incensos artesanais feitos com fé, natureza e propósito em {cfg.city} – {cfg.state}. Cada aroma carrega uma intenção. Enviamos para todo o Brasil.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg text-gold-300">Navegação</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream-100/70">
              <li><Link to="/" className="transition hover:text-gold-300">Início</Link></li>
              <li><Link to="/sobre" className="transition hover:text-gold-300">Sobre</Link></li>
              <li><Link to="/produtos" className="transition hover:text-gold-300">Produtos</Link></li>
              <li><Link to="/galeria" className="transition hover:text-gold-300">Galeria</Link></li>
              <li><Link to="/pagamento" className="transition hover:text-gold-300">Formas de pagamento</Link></li>
              <li><Link to="/rastreio" className="transition hover:text-gold-300">Rastrear pedido</Link></li>
              <li><Link to="/atacado" className="transition hover:text-gold-300">Atacado & parcerias</Link></li>
              <li><Link to="/contato" className="transition hover:text-gold-300">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-gold-300">Contato</h4>
            <ul className="mt-4 space-y-3 text-sm text-cream-100/70">
              <li>
                <a href={whatsappLink("Olá! Vim pelo site da Odoyá. 🌿")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-gold-300">
                  <MessageCircle size={16} /> {phoneDisplay}
                </a>
              </li>
              <li>
                <a href={cfg.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-gold-300">
                  <InstagramIcon size={16} /> {cfg.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} /> {cfg.city} – {cfg.state}
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} /> {cfg.businessHours.split("\n")[0]}
              </li>
              <li className="flex items-center gap-2">
                <Truck size={16} /> {cfg.shippingDays}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-gold-300">Nossos valores</h4>
            <ul className="mt-4 space-y-3 text-sm text-cream-100/70">
              <li className="flex items-center gap-2"><Leaf size={16} /> Respeito à natureza</li>
              <li className="flex items-center gap-2"><Package size={16} /> Produção artesanal</li>
              <li className="flex items-center gap-2">💜 Amor em cada detalhe</li>
              <li className="flex items-center gap-2">✨ Fé e espiritualidade</li>
            </ul>
          </div>
        </div>

        <div className="my-10">
          <Divider light />
        </div>

        <p className="text-center font-serif text-lg italic text-cream-100/80">
          "Cada aroma carrega um propósito. Cada defumação é um ato de amor, cuidado e conexão com o sagrado."
        </p>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-xs text-cream-100/50 md:flex-row">
          <p>© {new Date().getFullYear()} {cfg.storeName} · {cfg.city} – {cfg.state}. Todos os direitos reservados.</p>
          <p>
            Feito com 💜 por {cfg.ownerName} ·{" "}
            <Link to="/admin" className="underline-offset-2 hover:text-gold-300 hover:underline">
              Área administrativa
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
