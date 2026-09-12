import { CheckCircle2, Image as ImageIcon, MessageCircle, Star } from "lucide-react";
import { useMemo } from "react";
import { useReviews, reviewStats } from "../store/useReviews";
import { useStore } from "../store/useStore";
import { whatsappLink } from "../data/site";

export default function TestimonialsCarousel() {
  const { published } = useReviews();
  const { products } = useStore();
  const stats = useMemo(() => reviewStats(published), [published]);
  const photos = published.flatMap((review) => (review.photos ?? []).map((src) => ({ src, review })));

  return (
    <section className="bg-cream-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-plum-500">Avaliações reais</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-plum-950 md:text-5xl">
              Experiências compartilhadas<br />
              <span className="italic text-plum-600">por quem recebeu Odoyá.</span>
            </h2>
          </div>
          {stats.count > 0 && (
            <div className="text-right">
              <p className="font-display text-4xl font-bold tabular-nums text-plum-950">{stats.average.toFixed(1)}</p>
              <div className="mt-1 flex justify-end gap-0.5" aria-label={`Média ${stats.average.toFixed(1)} de 5`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} className={index < Math.round(stats.average) ? "fill-gold-500 text-gold-500" : "text-plum-200"} />
                ))}
              </div>
              <p className="mt-1 text-xs text-plum-500">{stats.count} avaliação{stats.count === 1 ? "" : "ões"}</p>
            </div>
          )}
        </div>

        {stats.count === 0 ? (
          <div className="mt-12 rounded-3xl border border-plum-100 bg-white p-8 text-center shadow-sm md:p-12">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-plum-100 text-plum-700">
              <MessageCircle size={22} />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold text-plum-950 md:text-3xl">A operação começou agora.</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-plum-600">
              Ainda não publicamos avaliações de clientes. Se você já recebeu um produto Odoyá, envie seu comentário e, se quiser, uma foto real pelo WhatsApp.
            </p>
            <a
              href={whatsappLink("Olá! Quero enviar uma avaliação real sobre meu pedido Odoyá. Posso enviar meu comentário e uma foto por aqui?")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-cream-50 transition hover:bg-plum-950"
            >
              <MessageCircle size={15} /> Enviar minha avaliação
            </a>
            <p className="mt-4 text-[0.7rem] text-plum-400">Só publicamos avaliações com autorização do cliente.</p>
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-6 lg:grid-cols-[260px_1fr]">
              <aside className="rounded-2xl border border-plum-100 bg-white p-5 shadow-sm">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-plum-500">Distribuição das notas</p>
                <div className="mt-4 space-y-2.5">
                  {stats.distribution.map((item) => {
                    const width = stats.count ? (item.count / stats.count) * 100 : 0;
                    return (
                      <div key={item.rating} className="flex items-center gap-2 text-xs">
                        <span className="flex w-7 items-center gap-1 font-semibold text-plum-700">{item.rating}<Star size={10} className="fill-gold-500 text-gold-500" /></span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-plum-100">
                          <div className="h-full rounded-full bg-gold-500" style={{ width: `${width}%` }} />
                        </div>
                        <span className="w-5 text-right tabular-nums text-plum-500">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </aside>

              <div className="grid gap-4 md:grid-cols-2">
                {published.map((review) => {
                  const product = products.find((item) => item.id === review.productId);
                  return (
                    <article key={review.id} className="rounded-2xl border border-plum-100 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-lg font-semibold text-plum-950">{review.name}</p>
                          {review.city && <p className="text-[0.7rem] text-plum-500">{review.city}</p>}
                        </div>
                        {review.verified && (
                          <span className="flex items-center gap-1 rounded-full bg-sage-400/15 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-sage-700">
                            <CheckCircle2 size={10} /> Cliente verificado
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex gap-0.5" aria-label={`${review.rating} de 5 estrelas`}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} size={13} className={index < review.rating ? "fill-gold-500 text-gold-500" : "text-plum-200"} />
                        ))}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-plum-700/80">“{review.comment}”</p>
                      <div className="mt-4 border-t border-plum-100 pt-3 text-[0.7rem] text-plum-500">
                        <p>{product?.name ?? "Produto não disponível"}</p>
                        <time>{new Date(review.date).toLocaleDateString("pt-BR")}</time>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {photos.length > 0 && (
              <div className="mt-10">
                <p className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-plum-500">
                  <ImageIcon size={13} /> Fotos enviadas por clientes
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {photos.map((photo, index) => (
                    <figure key={`${photo.review.id}-${index}`} className="overflow-hidden rounded-2xl border border-plum-100 bg-white">
                      <img src={photo.src} alt={`Foto enviada por ${photo.review.name}`} className="aspect-square w-full object-cover" loading="lazy" />
                      <figcaption className="px-3 py-2 text-[0.65rem] text-plum-500">{photo.review.name}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}