import { useEffect, useRef } from "react";

/**
 * Reveal on scroll com IntersectionObserver + MutationObserver.
 *
 * Fix crítico: elementos que já estão no viewport quando o hook roda
 * são marcados como visíveis IMEDIATAMENTE (sem animação), evitando que
 * o conteúdo acima da dobra fique invisível se o observer atrasar.
 */
export function useReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const isInViewport = (el: Element) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh && r.bottom > 0;
    };

    const arm = (el: Element) => {
      if (!el.classList.contains("reveal")) return;
      if (el.classList.contains("reveal-armed")) return;
      if (prefersReduced || isInViewport(el)) {
        // Já visível: mostra sem animação (segurança contra flash em branco)
        el.classList.add("reveal-armed", "is-visible");
        return;
      }
      el.classList.add("reveal-armed");
      observerRef.current?.observe(el);
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    // Arma todos os já presentes no próximo frame para garantir layout medido
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach(arm);
    });

    // Observa DOM dinâmico
    mutationRef.current = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as Element;
          if (el.classList?.contains("reveal")) arm(el);
          el.querySelectorAll?.(".reveal").forEach(arm);
        });
      }
    });
    mutationRef.current.observe(document.body, { childList: true, subtree: true });

    // Fallback: depois de 1.5s, força visibilidade de qualquer .reveal ainda oculto
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll(".reveal.reveal-armed:not(.is-visible)").forEach((el) => {
        el.classList.add("is-visible");
      });
    }, 1500);

    return () => {
      observerRef.current?.disconnect();
      mutationRef.current?.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);
}
