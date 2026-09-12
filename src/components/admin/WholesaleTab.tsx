import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Download, FileText, Handshake, MessageCircle, Search, Sparkles, Trash2 } from "lucide-react";
import { useWholesale, WHOLESALE_STATUS, type WholesaleLead, type WholesaleStatus } from "../../store/useWholesale";
import { useActivity } from "../../store/useActivityLog";
import { useToast } from "./Toast";
import AdminCard from "./AdminCard";
import AdminStat from "./AdminStat";
import AdminBadge from "./AdminBadge";

export default function WholesaleTab() {
  const wholesale = useWholesale();
  const { log } = useActivity();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WholesaleStatus | "todos">("todos");
  const [selected, setSelected] = useState<WholesaleLead | null>(null);
  const [notes, setNotes] = useState("");

  const leads = useMemo(() => wholesale.leads.filter((lead) => {
    const q = search.trim().toLowerCase();
    const matches = !q || [lead.company, lead.contactName, lead.email, lead.city, lead.segment].join(" ").toLowerCase().includes(q);
    return matches && (filter === "todos" || lead.status === filter);
  }), [wholesale.leads, search, filter]);

  const counts = useMemo(() => ({
    novo: wholesale.leads.filter((x) => x.status === "novo").length,
    contato: wholesale.leads.filter((x) => x.status === "contato").length,
    proposta: wholesale.leads.filter((x) => x.status === "proposta").length,
    aprovado: wholesale.leads.filter((x) => x.status === "aprovado").length,
  }), [wholesale.leads]);

  const selectLead = (lead: WholesaleLead) => {
    setSelected(lead);
    setNotes(lead.notes || "");
  };

  const updateStatus = (lead: WholesaleLead, status: WholesaleStatus) => {
    wholesale.updateStatus(lead.id, status);
    if (selected?.id === lead.id) setSelected({ ...lead, status });
    log("system", `Parceria atualizada: ${lead.company}`, `Status alterado para ${WHOLESALE_STATUS[status].label}.`);
    toast.success("Status atualizado", WHOLESALE_STATUS[status].label);
  };

  const contact = (lead: WholesaleLead) => {
    const text = [
      `Olá, ${lead.contactName.split(" ")[0]}! Aqui é da *Odoyá Ervas de Aruanda* 🌿`,
      "",
      `Recebemos o interesse da *${lead.company}* em conhecer nossas condições de parceria no atacado.`,
      "",
      `Vimos que vocês atuam como *${lead.segment}* e querem trabalhar com ${lead.channels.length ? lead.channels.join(", ") : "produtos artesanais Odoyá"}.`,
      "",
      "Posso apresentar nossa curadoria, a tabela profissional e sugerir um primeiro lote de acordo com o perfil do seu público?",
      "",
      "Com carinho,\n*Jéssica* · Odoyá Ervas de Aruanda",
    ].join("\n");
    const phone = lead.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    wholesale.markContacted(lead.id);
    log("system", `Contato B2B iniciado: ${lead.company}`, "Mensagem aberta no WhatsApp.");
    toast.info("WhatsApp aberto", `Contato com ${lead.contactName}.`);
  };

  const saveNotes = () => {
    if (!selected) return;
    wholesale.updateLead({ ...selected, notes, updatedAt: new Date().toISOString() });
    setSelected({ ...selected, notes });
    log("system", `Notas B2B atualizadas: ${selected.company}`);
    toast.success("Anotações salvas");
  };

  const exportLeads = () => {
    const header = "Empresa,Contato,Email,WhatsApp,Cidade,UF,Segmento,Volume,Status,Canais,Criado em\n";
    const rows = wholesale.leads.map((l) => [l.company, l.contactName, l.email, l.phone, l.city, l.state, l.segment, l.volume, WHOLESALE_STATUS[l.status].label, l.channels.join(" | "), new Date(l.createdAt).toLocaleDateString("pt-BR")].map((x) => `\"${String(x).replace(/\"/g, '\"\"')}\"`).join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `odoya-parcerias-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Leads exportados", `${wholesale.leads.length} contatos em CSV.`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-plum-400">Relacionamento B2B</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-plum-950 md:text-4xl">Atacado & parcerias</h1>
          <p className="mt-1 text-sm text-plum-600">Leads de lojas, terapeutas e espaços que querem revender Odoyá.</p>
        </div>
        <button onClick={exportLeads} className="flex items-center gap-2 rounded-lg border border-plum-200 bg-white px-4 py-2 text-sm font-semibold text-plum-700 shadow-sm transition hover:border-plum-300 hover:bg-plum-50">
          <Download size={14} /> Exportar leads
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat label="Novos interesses" value={counts.novo} icon={<Sparkles size={16} />} accent="gold" hint="Aguardando primeiro contato" />
        <AdminStat label="Em conversa" value={counts.contato} icon={<MessageCircle size={16} />} accent="plum" hint="WhatsApp ou e-mail em andamento" />
        <AdminStat label="Propostas" value={counts.proposta} icon={<FileText size={16} />} accent="ink" hint="Condições enviadas para análise" />
        <AdminStat label="Parceiros ativos" value={counts.aprovado} icon={<Handshake size={16} />} accent="sage" hint="Relacionamento aprovado" />
      </div>

      <AdminCard padding="sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar empresa, contato, cidade ou segmento..." className="w-full rounded-xl border border-plum-200 bg-cream-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-plum-400" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as WholesaleStatus | "todos")} className="rounded-xl border border-plum-200 bg-cream-50 px-3 py-2.5 text-sm text-plum-800 outline-none focus:border-plum-400">
            <option value="todos">Todos os status</option>
            {(Object.keys(WHOLESALE_STATUS) as WholesaleStatus[]).map((s) => <option key={s} value={s}>{WHOLESALE_STATUS[s].label}</option>)}
          </select>
        </div>
      </AdminCard>

      <div className="grid gap-3">
        {leads.length === 0 && <div className="rounded-2xl border border-dashed border-plum-200 bg-white py-14 text-center text-sm text-plum-500">Nenhum contato de atacado encontrado.</div>}
        {leads.map((lead) => {
          const meta = WHOLESALE_STATUS[lead.status];
          return (
            <article key={lead.id} className="rounded-2xl border border-plum-100 bg-white p-5 shadow-sm transition hover:border-plum-200 hover:shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-plum-900 font-display text-lg font-bold text-gold-300">{lead.company.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-display text-xl font-bold text-plum-950">{lead.company}</h3>
                      <AdminBadge variant={meta.color as any} dot>{meta.label}</AdminBadge>
                    </div>
                    <p className="text-sm text-plum-600">{lead.contactName} · {lead.segment} · {lead.city}/{lead.state}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {lead.channels.slice(0, 3).map((c) => <span key={c} className="rounded-full bg-plum-50 px-2 py-0.5 text-[0.65rem] text-plum-600">{c}</span>)}
                      <span className="rounded-full bg-gold-300/20 px-2 py-0.5 text-[0.65rem] text-gold-700">{lead.volume}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <select value={lead.status} onChange={(e) => updateStatus(lead, e.target.value as WholesaleStatus)} className="rounded-lg border border-plum-200 bg-cream-50 px-2.5 py-2 text-xs font-semibold text-plum-700 outline-none">
                    {(Object.keys(WHOLESALE_STATUS) as WholesaleStatus[]).map((s) => <option key={s} value={s}>{WHOLESALE_STATUS[s].label}</option>)}
                  </select>
                  <button onClick={() => contact(lead)} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"><MessageCircle size={13} /> Contatar</button>
                  <button onClick={() => selectLead(lead)} className="rounded-lg border border-plum-200 p-2 text-plum-600 hover:bg-plum-50" title="Ver detalhes"><ChevronRight size={15} /></button>
                  <button onClick={() => { if (confirm(`Excluir o contato de ${lead.company}?`)) { wholesale.deleteLead(lead.id); toast.error("Lead removido", lead.company); } }} className="rounded-lg p-2 text-rose-deep hover:bg-rose-deep/10" title="Excluir"><Trash2 size={15} /></button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-plum-950/70 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-plum-100 pb-4">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-plum-500">Detalhe da parceria</p>
                <h2 className="mt-1 font-display text-3xl font-bold text-plum-950">{selected.company}</h2>
                <p className="text-sm text-plum-600">{selected.contactName} · {selected.segment}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-plum-500 hover:bg-plum-50">×</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Detail label="Contato" value={selected.contactName} />
              <Detail label="E-mail" value={selected.email} />
              <Detail label="WhatsApp" value={selected.phone} />
              <Detail label="Localização" value={`${selected.city}/${selected.state}`} />
              <Detail label="Volume" value={selected.volume} />
              <Detail label="Segmento" value={selected.segment} />
              <div className="sm:col-span-2"><Detail label="Canais" value={selected.channels.length ? selected.channels.join(" · ") : "Não informado"} /></div>
              <div className="sm:col-span-2"><Detail label="Mensagem" value={selected.message || "Sem mensagem adicional"} /></div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-plum-500">Anotações internas</label>
                <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: enviar tabela, retorno previsto, condições negociadas..." className="w-full rounded-xl border border-plum-200 bg-cream-50 p-3 text-sm outline-none focus:border-plum-400" />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-plum-100 pt-5">
              <button onClick={() => contact(selected)} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><MessageCircle size={14} /> Abrir WhatsApp</button>
              <button onClick={saveNotes} className="flex items-center gap-2 rounded-lg bg-plum-900 px-4 py-2.5 text-sm font-bold text-cream-50 hover:bg-plum-950"><CheckCircle2 size={14} /> Salvar notas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-cream-50 p-3"><p className="text-[0.6rem] font-bold uppercase tracking-wider text-plum-500">{label}</p><p className="mt-1 text-sm text-plum-900">{value}</p></div>;
}
