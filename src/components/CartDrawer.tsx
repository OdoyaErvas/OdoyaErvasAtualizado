import { useMemo, useState } from "react";
import {
  X, Minus, Plus, Send, Trash2, ShoppingBag, Truck, Gift, Heart,
  Zap, Tag,
} from "lucide-react";
import { useCart } from "../store/useCart";
import { useStore } from "../store/useStore";
import { useSettings } from "../store/useSettings";
import { whatsappLink } from "../data/site";
import { RITUAL_KITS } from "../data/kits";
import type { Product } from "../data/products";
import FreteCalculator from "./FreteCalculator";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    items, addItem, removeItem, updateQuantity, clear,
    giftWrap, setGiftWrap, giftCardMessage, setGiftCardMessage,
  } = useCart();
  const { products } = useStore();
  const { storeConfig, paymentMethods } = useSettings();

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalItens = items.reduce((s, i) => s + i.quantity, 0);
  const [frete, setFrete] = useState<{ valor: number; label: string } | null>(null);

  const threshold = storeConfig.freeShippingThreshold || 199;
  const freteGratis = subtotal >= threshold;
  const freteValor = freteGratis ? 0 : (frete?.valor ?? 0);

  // ── PIX discount from settings ──
  const pixMethod = paymentMethods.find((m) => m.id === "pix" || m.name.toLowerCase().includes("pix"));
  const pixDiscountPct = useMemo(() => {
    if (!pixMethod?.discount) return 0;
    const match = pixMethod.discount.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }, [pixMethod]);
  const pixDiscount = pixDiscountPct > 0 ? Math.round(subtotal * (pixDiscountPct / 100) * 100) / 100 : 0;
  const totalComPix = subtotal - pixDiscount + freteValor;
  const total = subtotal + freteValor;

  // ── Frete grátis progress ──
  const freeShipProgress = Math.min(100, (subtotal / threshold) * 100);
  const freeShipRemaining = Math.max(0, threshold - subtotal);

  // ── Smart cross-sell: find a product NOT in cart, from a complementary category ──
  const cartCategories = new Set(items.map((i) => i.product.category));
  const cartIds = new Set(items.map((i) => i.product.id));
  const crossSellProducts = useMemo(() => {
    // Prioritize: if cart has only incense, suggest a bath; if only bath, suggest incense; etc.
    const complementary = products.filter(
      (p) => !cartIds.has(p.id) && p.available && p.stock > 0
    );
    // Sort: different category first, then by featured/bestSeller
    return complementary
      .sort((a, b) => {
        const aComp = !cartCategories.has(a.category) ? 1 : 0;
        const bComp = !cartCategories.has(b.category) ? 1 : 0;
        if (bComp !== aComp) return bComp - aComp;
        return Number(!!b.featured) - Number(!!a.featured);
      })
      .slice(0, 2);
  }, [products, cartIds, cartCategories]);

  // ── Kit match: check if cart items match any kit ──
  const kitMatch = useMemo(() => {
    if (items.length < 2) return null;

    for (const kit of RITUAL_KITS) {
      if (kit.discountPct <= 0) continue;

      const kitProducts = kit.productIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => !!p && p.available);

      if (kitProducts.length < 2) continue;

      // Check if at least 2 cart items are in this kit
      const overlap = kitProducts.filter((kp) => cartIds.has(kp.id));
      if (overlap.length < 2) continue;

      const kitTotal = kitProducts.reduce((s, p) => s + p.price, 0);
      const kitPromo = Math.round(kitTotal * (1 - kit.discountPct / 100) * 100) / 100;
      const currentCost = overlap.reduce((s, p) => {
        const cartItem = items.find((i) => i.product.id === p.id);
        return s + p.price * (cartItem?.quantity ?? 1);
      }, 0);
      const savings = currentCost - kitPromo;

      if (savings > 0) {
        return {
          kit,
          kitProducts,
          kitTotal,
          kitPromo,
          savings,
          missingProducts: kitProducts.filter((p) => !cartIds.has(p.id)),
        };
      }
    }
    return null;
  }, [items, products, cartIds]);

  // ── WhatsApp message ──
  const sendWhatsApp = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const lines = [
      "═══════════════════",
      "🌿 *PEDIDO ODOYÁ ERVAS DE ARUANDA*",
      "═══════════════════",
      "",
      `📅 Data: ${dateStr}`,
      "",
      "📦 *ITENS DO PEDIDO:*",
      "───────────────────",
      ...items.map((i, idx) => [
        `${idx + 1}. *${i.product.name}*`,
        `   Qtd: ${i.quantity} | R$ ${i.product.price.toFixed(2)} cada`,
        `   Subtotal: *R$ ${(i.product.price * i.quantity).toFixed(2)}*`,
      ].join("\n")),
      "───────────────────",
      "",
      giftWrap ? "🎁 *EMBALAGEM PARA PRESENTE:* Sim" : "",
      giftWrap && giftCardMessage ? `✉️ *DEDICATÓRIA:* "${giftCardMessage}"` : "",
      "",
      `📋 Total de itens: ${totalItens}`,
      `💰 Subtotal: R$ ${subtotal.toFixed(2)}`,
      pixDiscount > 0 ? `⚡ Desconto PIX (${pixDiscountPct}%): -R$ ${pixDiscount.toFixed(2)}` : "",
      frete ? `🚚 Frete (${frete.label}): ${freteGratis ? "GRÁTIS 🎉" : `R$ ${freteValor.toFixed(2)}`}` : "🚚 Frete: A combinar",
      "",
      "═══════════════════",
      pixDiscount > 0
        ? `🛒 *TOTAL COM PIX: R$ ${totalComPix.toFixed(2)}*`
        : `🛒 *TOTAL DO PEDIDO: R$ ${total.toFixed(2)}*`,
      "═══════════════════",
      "",
      "Olá! Gostaria de finalizar este pedido. 💜",
    ].filter(Boolean).join("\n");

    window.open(whatsappLink(lines), "_blank");
    clear();
    setFrete(null);
    onClose();
  };

  const brl = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-plum-900/50 backdrop-blur-sm transition" onClick={onClose} />
      )}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-plum-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-plum-100 text-plum-700">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-plum-800">Seu Pedido</h2>
              <p className="text-xs text-plum-900/50">
                {items.length === 0 ? "Nenhum item" : `${totalItens} ${totalItens === 1 ? "item" : "itens"}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-plum-500 transition hover:bg-plum-100" aria-label="Fechar carrinho">
            <X size={20} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-plum-50">
                <ShoppingBag size={32} className="text-plum-300" />
              </div>
              <p className="mt-4 font-serif text-xl text-plum-800">Seu carrinho está vazio</p>
              <p className="mt-1 text-sm text-plum-900/50">Adicione produtos para montar seu pedido.</p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full border border-plum-200 px-6 py-2.5 text-sm font-medium text-plum-700 transition hover:bg-plum-50"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ── 1) Barra de frete grátis ── */}
              <div className="rounded-2xl border border-plum-100 bg-white p-4 shadow-sm">
                {freteGratis ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-sage-700">
                    <Truck size={16} className="text-sage-500" />
                    Parabéns! Você ganhou <strong>frete grátis</strong> 🎉
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-medium text-plum-700">
                      Faltam <strong className="text-plum-900">{brl(freeShipRemaining)}</strong> para frete grátis
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-plum-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-plum-600 to-gold-400 transition-all duration-500"
                        style={{ width: `${freeShipProgress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[0.65rem] text-plum-500">Acima de {brl(threshold)}</p>
                  </>
                )}
              </div>

              {/* ── 2) Item list ── */}
              {items.map((i) => (
                <div key={i.product.id} className="flex items-center gap-3 rounded-2xl border border-plum-100 bg-white p-3 shadow-sm">
                  {i.product.image ? (
                    <img src={i.product.image} alt={i.product.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${i.product.color}22` }}>
                      {i.product.emoji}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-plum-800">{i.product.name}</p>
                    <p className="text-xs text-plum-900/55">{i.product.weight}</p>
                    <p className="mt-1 font-serif text-sm font-semibold text-plum-700">
                      {brl(i.product.price * i.quantity)}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1 rounded-xl border border-plum-200 bg-cream-50">
                      <button
                        onClick={() => i.quantity <= 1 ? removeItem(i.product.id) : updateQuantity(i.product.id, i.quantity - 1)}
                        className="rounded-l-xl px-2 py-1 text-plum-600 hover:bg-plum-100"
                        aria-label="Diminuir"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[24px] text-center text-sm font-semibold text-plum-800">{i.quantity}</span>
                      <button
                        onClick={() => updateQuantity(i.product.id, i.quantity + 1)}
                        className="rounded-r-xl px-2 py-1 text-plum-600 hover:bg-plum-100"
                        aria-label="Aumentar"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(i.product.id)} className="text-[0.65rem] text-rose-deep hover:underline">Remover</button>
                  </div>
                </div>
              ))}

              {/* ── 3) Kit match suggestion ── */}
              {kitMatch && (
                <div className="rounded-2xl border-2 border-gold-400/50 bg-gradient-to-r from-gold-300/10 to-plum-50 p-4">
                  <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-gold-700">
                    <Tag size={12} /> Economize levando o ritual completo
                  </div>
                  <h4 className="mt-2 font-display text-lg font-semibold text-plum-900">
                    {kitMatch.kit.emoji} {kitMatch.kit.name}
                  </h4>
                  <p className="mt-1 text-xs text-plum-700/80">{kitMatch.kit.description}</p>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-xs text-plum-500 line-through">{brl(kitMatch.kitTotal)}</span>
                    <span className="font-display text-xl font-bold text-plum-900">{brl(kitMatch.kitPromo)}</span>
                    <span className="rounded-full bg-sage-400/20 px-2 py-0.5 text-[0.6rem] font-bold text-sage-700">
                      Economia de {brl(kitMatch.savings)}
                    </span>
                  </div>
                  {kitMatch.missingProducts.length > 0 && (
                    <div className="mt-2 text-[0.65rem] text-plum-600">
                      Falta adicionar: {kitMatch.missingProducts.map((p) => p.name).join(", ")}
                    </div>
                  )}
                  <button
                    onClick={() => kitMatch.missingProducts.forEach((p) => addItem(p))}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 py-2.5 text-xs font-bold text-plum-950 shadow transition hover:bg-gold-300"
                  >
                    <Plus size={13} /> Completar kit e economizar
                  </button>
                </div>
              )}

              {/* ── 4) Smart cross-sell ── */}
              {crossSellProducts.length > 0 && !kitMatch && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-plum-500">
                    <Heart size={11} className="text-gold-500" /> Complete seu ritual
                  </p>
                  {crossSellProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl border border-plum-100 bg-white p-2.5">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl" style={{ backgroundColor: `${p.color}15` }}>{p.emoji}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-plum-800">{p.name}</p>
                        <p className="text-[0.65rem] text-plum-500">{brl(p.price)}</p>
                      </div>
                      <button
                        onClick={() => addItem(p)}
                        className="shrink-0 rounded-full bg-plum-800 p-2 text-cream-50 transition hover:bg-plum-900"
                        aria-label={`Adicionar ${p.name}`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── 5) Embrulho para presente ── */}
              <div className="rounded-2xl border border-plum-100 bg-white p-4 shadow-sm">
                <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-plum-700">
                  <span className="flex items-center gap-2">
                    <Gift size={15} className="text-gold-500" /> Embrulho para presente?
                  </span>
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="h-4 w-4 rounded border-plum-300 text-plum-700 focus:ring-plum-500"
                  />
                </label>
                {giftWrap && (
                  <div className="mt-3 space-y-2">
                    <span className="block text-[0.65rem] font-semibold text-plum-500">Mensagem do cartão (opcional):</span>
                    <textarea
                      value={giftCardMessage}
                      onChange={(e) => setGiftCardMessage(e.target.value)}
                      placeholder="Para quem é o presente e o que deseja escrever..."
                      rows={2}
                      maxLength={180}
                      className="w-full resize-none rounded-xl border border-plum-200 bg-cream-50 p-3 text-xs outline-none focus:border-plum-500"
                    />
                  </div>
                )}
              </div>

              {/* ── 6) Frete calculator ── */}
              <FreteCalculator
                qtdItens={totalItens}
                totalPedido={subtotal}
                onSelectFrete={(v, l) => setFrete({ valor: v, label: l })}
                compact
              />

              {/* ── Clear ── */}
              <button
                onClick={clear}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-plum-200 py-2.5 text-xs text-plum-500 transition hover:border-rose-deep/30 hover:text-rose-deep"
              >
                <Trash2 size={13} /> Limpar carrinho
              </button>
            </div>
          )}
        </div>

        {/* ── Footer / Checkout ── */}
        {items.length > 0 && (
          <div className="border-t border-plum-100 bg-white px-5 py-4">
            {/* PIX highlight */}
            {pixDiscountPct > 0 && (
              <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-gold-400/40 bg-gold-300/10 px-3 py-2.5">
                <Zap size={16} className="shrink-0 text-gold-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gold-800">
                    Pague no PIX e ganhe {pixDiscountPct}% off
                  </p>
                  <p className="text-[0.65rem] text-gold-700/75">
                    Total com PIX: <strong className="text-gold-900">{brl(totalComPix)}</strong>
                    <span className="ml-1 text-sage-700">(economia de {brl(pixDiscount)})</span>
                  </p>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-plum-900/65">
                <span>Subtotal ({totalItens} {totalItens === 1 ? "item" : "itens"})</span>
                <span>{brl(subtotal)}</span>
              </div>
              {pixDiscountPct > 0 && (
                <div className="flex justify-between text-sage-700">
                  <span className="flex items-center gap-1"><Zap size={12} /> Desconto PIX ({pixDiscountPct}%)</span>
                  <span>− {brl(pixDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-plum-900/65">
                <span className="flex items-center gap-1"><Truck size={14} /> Frete</span>
                <span>
                  {frete
                    ? freteGratis
                      ? <span className="font-semibold text-sage-600">Grátis 🎉</span>
                      : brl(freteValor)
                    : <span className="text-xs text-plum-400">Calcule acima</span>}
                </span>
              </div>
              <div className="flex justify-between border-t border-plum-100 pt-2">
                <span className="font-serif text-lg font-bold text-plum-800">Total</span>
                <div className="text-right">
                  <p className="font-serif text-lg font-bold text-plum-800">{brl(total)}</p>
                  {pixDiscountPct > 0 && (
                    <p className="text-[0.65rem] font-semibold text-gold-700">
                      ou {brl(totalComPix)} no PIX
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={sendWhatsApp}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 text-base font-bold text-white shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02] hover:bg-[#1fbd5c]"
            >
              <Send size={18} /> Finalizar pedido pelo WhatsApp
            </button>

            <p className="mt-3 text-center text-[0.65rem] text-plum-900/40">
              Uma mensagem será enviada ao nosso WhatsApp com os detalhes do pedido.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
