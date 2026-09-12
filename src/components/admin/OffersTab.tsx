import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, Eye, EyeOff, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useOffers, type CommercialOffer, type OfferBadge, type OfferKind } from "../../store/useOffers";
import { useStore } from "../../store/useStore";
import { RITUAL_KITS } from "../../data/kits";
import { useToast } from "./Toast";
import AdminCard from "./AdminCard";
import AdminStat from "./AdminStat";
import AdminBadge from "./AdminBadge";
import ImageUploader from "../ImageUploader";

const EMPTY: Omit<CommercialOffer, "id" | "createdAt" | "updatedAt"> = {
  enabled: true,
  kind: "product",
  referenceId: "",
  title: "",
  description: "",
  originalPrice: undefined,
  promotionalPrice: undefined,
  validUntil: "",
  image: "",
  cta: "Quero este ritual",
  badge: "Condição especial",
  featured: true,
};

export default function OffersTab() {
  const offers = useOffers();
  const toast = useToast();
  const [editing, setEditing] = useState<CommercialOffer | null>(null);
  const [creating, setCreating] = useState(false);

  const active = offers.activeOffer;
  const enabledCount = offers.offers.filter((offer) => offer.enabled).length;
  const expiredCount = offers.offers.filter((offer) => offer.validUntil && new Date(`${offer.validUntil}T23:59:59`).getTime() < Date.now()).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-plum-400">Motor comercial</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-plum-950 md:text-4xl">Ofertas</h1>
          <p className="mt-1 text-sm text-plum-600">A homepage exibe somente uma oferta principal, quando ela estiver ativa e válida.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg bg-plum-900 px-4 py-2.5 text-sm font-bold text-cream-50 shadow-md hover:bg-plum-950">
          <Plus size={14} /> Nova oferta
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStat label="Oferta no ar" value={active ? 1 : 0} icon={<Sparkles size={16} />} accent="gold" hint={active?.title || "Nenhuma oferta publicada"} />
        <AdminStat label="Ofertas ativas" value={enabledCount} icon={<Eye size={16} />} accent="sage" hint="Inclui ofertas sem destaque" />
        <AdminStat label="Validade encerrada" value={expiredCount} icon={<Calendar size={16} />} accent="rose" hint="Não aparecem no site" />
      </div>

      {!active && (
        <AdminCard variant="ghost" title="Nenhuma oferta em destaque" subtitle="O site continuará normalmente, sem bloco promocional e sem urgência artificial.">
          <p className="text-sm text-plum-600">Crie uma oferta somente quando houver uma condição comercial real para produto ou kit existente.</p>
        </AdminCard>
      )}

      <div className="grid gap-3">
        {offers.offers.length === 0 && <div className="rounded-2xl border border-dashed border-plum-200 bg-white py-14 text-center text-sm text-plum-500">Nenhuma oferta cadastrada.</div>}
        {offers.offers.map((offer) => {
          const expired = Boolean(offer.validUntil && new Date(`${offer.validUntil}T23:59:59`).getTime() < Date.now());
          return (
            <article key={offer.id} className="rounded-2xl border border-plum-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-bold text-plum-950">{offer.title || "Oferta sem título"}</h3>
                    {offer.featured && <AdminBadge variant="gold" dot>Destaque</AdminBadge>}
                    {!offer.enabled && <AdminBadge variant="neutral">Desativada</AdminBadge>}
                    {expired && <AdminBadge variant="danger">Expirada</AdminBadge>}
                  </div>
                  <p className="mt-1 text-sm text-plum-600">{offer.kind === "kit" ? "Kit" : "Produto"} · {offer.badge || "Sem chamada de urgência"}</p>
                  {offer.validUntil && <p className="mt-1 text-[0.7rem] text-plum-500">Validade: {new Date(`${offer.validUntil}T12:00:00`).toLocaleDateString("pt-BR")}</p>}
                </div>
                <div className="flex items-center justify-end gap-1">
                  {!offer.featured && <button onClick={() => { offers.setFeatured(offer.id); toast.success("Oferta destacada", offer.title); }} className="rounded-lg p-2 text-gold-700 hover:bg-gold-300/15" title="Destacar"><CheckCircle2 size={16} /></button>}
                  <button onClick={() => { offers.updateOffer({ ...offer, enabled: !offer.enabled }); toast.info(offer.enabled ? "Oferta desativada" : "Oferta ativada"); }} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50" title={offer.enabled ? "Desativar" : "Ativar"}>{offer.enabled ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                  <button onClick={() => setEditing(offer)} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50" title="Editar"><Pencil size={16} /></button>
                  <button onClick={() => { if (confirm(`Excluir a oferta "${offer.title}"?`)) { offers.deleteOffer(offer.id); toast.error("Oferta excluída", offer.title); } }} className="rounded-lg p-2 text-rose-deep hover:bg-rose-deep/10" title="Excluir"><Trash2 size={16} /></button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {(creating || editing) && (
        <OfferEditor
          offer={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(data) => {
            if (editing) offers.updateOffer({ ...editing, ...data });
            else offers.addOffer(data);
            toast.success(editing ? "Oferta atualizada" : "Oferta criada", data.title || "Condição comercial salva");
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function OfferEditor({ offer, onClose, onSave }: { offer: CommercialOffer | null; onClose: () => void; onSave: (offer: Omit<CommercialOffer, "id" | "createdAt" | "updatedAt">) => void }) {
  const { products } = useStore();
  const [form, setForm] = useState({ ...EMPTY, ...(offer ?? {}) });

  const references = useMemo(() => form.kind === "product"
    ? products.map((product) => ({ id: product.id, name: product.name }))
    : RITUAL_KITS.map((kit) => ({ id: kit.id, name: kit.name })), [form.kind, products]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-plum-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-plum-100 pb-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-plum-500">Motor de ofertas</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-plum-950">{offer ? "Editar oferta" : "Nova oferta"}</h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Tipo">
            <select value={form.kind} onChange={(event) => { set("kind", event.target.value as OfferKind); set("referenceId", ""); }} className={inputClass}>
              <option value="product">Produto</option>
              <option value="kit">Kit</option>
            </select>
          </Field>
          <Field label="Produto ou kit">
            <select value={form.referenceId} onChange={(event) => set("referenceId", event.target.value)} className={inputClass}>
              <option value="">Selecione</option>
              {references.map((reference) => <option key={reference.id} value={reference.id}>{reference.name}</option>)}
            </select>
          </Field>
          <Field label="Título" full><input value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="Ex.: Ritual de Proteção da Semana" className={inputClass} /></Field>
          <Field label="Descrição" full><textarea rows={3} value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Explique a condição e o benefício real." className={`${inputClass} resize-none`} /></Field>
          <Field label="Preço original (opcional)"><input type="number" min="0" step="0.01" value={form.originalPrice ?? ""} onChange={(event) => set("originalPrice", event.target.value ? parseFloat(event.target.value) : undefined)} className={inputClass} /></Field>
          <Field label="Preço promocional (opcional)"><input type="number" min="0" step="0.01" value={form.promotionalPrice ?? ""} onChange={(event) => set("promotionalPrice", event.target.value ? parseFloat(event.target.value) : undefined)} className={inputClass} /></Field>
          <Field label="Validade real (opcional)"><input type="date" value={form.validUntil || ""} onChange={(event) => set("validUntil", event.target.value)} className={inputClass} /></Field>
          <Field label="Chamada">
            <select value={form.badge} onChange={(event) => set("badge", event.target.value as OfferBadge)} className={inputClass}>
              <option value="">Sem chamada</option>
              <option value="Oferta da semana">Oferta da semana</option>
              <option value="Condição especial">Condição especial</option>
              <option value="Enquanto durar o estoque">Enquanto durar o estoque</option>
            </select>
          </Field>
          <Field label="Texto do CTA" full><input value={form.cta} onChange={(event) => set("cta", event.target.value)} placeholder="Quero este ritual" className={inputClass} /></Field>
          <Field label="Imagem da oferta" full><ImageUploader value={form.image || ""} onChange={(value) => set("image", value)} emojiFallback="✨" /></Field>
          <div className="space-y-2 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-plum-700"><input type="checkbox" checked={form.enabled} onChange={(event) => set("enabled", event.target.checked)} /> Oferta ativa</label>
            <label className="flex items-center gap-2 text-sm text-plum-700"><input type="checkbox" checked={form.featured} onChange={(event) => set("featured", event.target.checked)} /> Exibir como única oferta principal na homepage</label>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-plum-100 pt-5 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-lg border border-plum-200 px-5 py-2.5 text-sm font-semibold text-plum-700 hover:bg-plum-50">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!form.referenceId} className="rounded-lg bg-plum-900 px-5 py-2.5 text-sm font-bold text-cream-50 hover:bg-plum-950 disabled:opacity-40">Salvar oferta</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={full ? "sm:col-span-2" : ""}><span className="mb-1.5 block text-xs font-semibold text-plum-700">{label}</span>{children}</label>;
}

const inputClass = "w-full rounded-xl border border-plum-200 bg-cream-50 px-4 py-2.5 text-sm text-plum-900 outline-none focus:border-plum-500 focus:ring-2 focus:ring-plum-200";