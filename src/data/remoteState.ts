import { useEffect, useRef, useState } from "react";

/**
 * Estado compartilhado no servidor.
 * Leitura pública quando permitida pela API.
 * Escrita exige sessão administrativa.
 */
export function useRemoteState<T>(
  key: string,
  fallback: T,
  options: { poll?: boolean } = {},
) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  const fallbackRef = useRef(fallback);
  const valueRef = useRef(value);
  const hydratedRef = useRef(false);
  const skipPersistRef = useRef(false);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const saveVersionRef = useRef(0);

  valueRef.current = value;

  useEffect(() => {
    let active = true;

    const load = async () => {
      // Não permita que uma leitura antiga sobrescreva uma alteração
      // local que ainda está sendo enviada ao servidor.
      if (dirtyRef.current || savingRef.current) return;

      try {
        const response = await fetch(
          `/api/state?key=${encodeURIComponent(key)}`,
          {
            credentials: "same-origin",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          console.error(
            `[remoteState:${key}] GET falhou: ${response.status}`,
          );
          return;
        }

        const body = (await response.json()) as { value: T | null };

        if (!active) return;

        if (body.value !== null) {
          skipPersistRef.current = true;
          setValue(body.value);
        }

        hydratedRef.current = true;
      } catch (error) {
        console.error(`[remoteState:${key}] erro ao carregar`, error);
      } finally {
        if (active) setReady(true);
      }
    };

    void load();

    const timer = options.poll
      ? window.setInterval(load, 20_000)
      : undefined;

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, [key, options.poll]);

  useEffect(() => {
    if (!ready || !hydratedRef.current) return;

    // A alteração veio do GET/polling, portanto não deve gerar PUT.
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }

    dirtyRef.current = true;
    const version = ++saveVersionRef.current;

    const timer = window.setTimeout(async () => {
      savingRef.current = true;

      try {
        const response = await fetch(
          `/api/state?key=${encodeURIComponent(key)}`,
          {
            method: "PUT",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({
              value: valueRef.current,
            }),
          },
        );

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          console.error(
            `[remoteState:${key}] PUT falhou: ${response.status}`,
            text,
          );
          return;
        }

        // Só limpamos dirty se esta ainda for a última alteração.
        if (version === saveVersionRef.current) {
          dirtyRef.current = false;
        }

        console.log(`[remoteState:${key}] salvo no servidor`);
      } catch (error) {
        console.error(`[remoteState:${key}] erro ao salvar`, error);
      } finally {
        savingRef.current = false;
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [key, ready, value]);

  return {
    value,
    setValue,
    ready,
  };
}