import { useEffect } from "react";

const BRAND = "Odoyá Ervas de Aruanda";

type MetaOptions = {
  title?: string;
  description?: string;
  /** Se true, usa o title exatamente como informado, sem adicionar " | Odoyá …" */
  raw?: boolean;
};

/**
 * Atualiza <title> e <meta name="description"> por rota.
 * Uso em qualquer página: usePageMeta({ title: "Produtos", description: "…" })
 */
export function usePageMeta({ title, description, raw = false }: MetaOptions = {}) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = raw ? title : `${title} | ${BRAND}`;
    return () => {
      document.title = previous;
    };
  }, [title, raw]);

  useEffect(() => {
    if (!description) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousContent = tag?.content ?? "";
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    tag.content = description;
    return () => {
      if (tag) tag.content = previousContent;
    };
  }, [description]);
}
