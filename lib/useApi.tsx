"use client";

import { useCallback, useEffect, useState } from "react";
import type { Envelope, Provenance } from "./types";

/**
 * Small fetch hook. Every backend response is { data, provenance },
 * so we unwrap once here and expose both.
 */
export function useApi<T>(fn: () => Promise<Envelope<T>>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [provenance, setProvenance] = useState<Provenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fn()
      .then((r) => {
        if (!alive) return;
        setData(r.data);
        setProvenance(r.provenance ?? null);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  return { data, provenance, loading, error, refetch };
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="panel flex items-center gap-3 p-4 text-sm text-ice-300/70">
      <span className="h-3 w-3 animate-pulse rounded-full bg-ice-400" />
      {label}…
    </div>
  );
}
