import { useEffect, useRef, useState } from "react";

/** Shared, server-backed state. Writes require the admin HTTP-only session. */
export function useRemoteState<T>(key: string, fallback: T, options: { poll?: boolean } = {}) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  const fallbackRef = useRef(fallback);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/state?key=${encodeURIComponent(key)}`, { credentials: "same-origin" });
        if (!response.ok) return;
        const body = await response.json() as { value: T | null };
        if (active && body.value !== null) setValue(body.value);
      } catch {
        // The fallback keeps the public storefront usable while offline.
      } finally {
        if (active) setReady(true);
      }
    };
    void load();
    const timer = options.poll ? window.setInterval(load, 20_000) : undefined;
    return () => { active = false; if (timer) window.clearInterval(timer); };
  }, [key, options.poll]);

  useEffect(() => {
    if (!ready || value === fallbackRef.current) return;
    const timer = window.setTimeout(() => {
      void fetch(`/api/state?key=${encodeURIComponent(key)}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: valueRef.current }),
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [key, ready, value]);

  return { value, setValue, ready };
}
