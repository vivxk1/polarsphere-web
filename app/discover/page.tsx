"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar, Empty } from "@/components/Provenance";
import type { Envelope, Provenance, SearchResult } from "@/lib/types";

const DOC_TYPES = ["report", "paper", "dataset-documentation"];

function DiscoverInner() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const [station, setStation] = useState("");
  const [docType, setDocType] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [prov, setProv] = useState<Provenance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const run = async (value: string) => {
    const term = value.trim();
    if (!term) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const r: Envelope<SearchResult> = await api.search(term, {
        limit: 20,
        ...(station ? { station } : {}),
        ...(docType ? { docType } : {}),
      });
      setResult(r.data);
      setProv(r.provenance ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQ) run(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const docs = result?.documents ?? [];
  const datasets = result?.datasets ?? [];
  const media = result?.media ?? [];
  const total = docs.length + datasets.length + media.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ice-50">Discover</h1>
        <p className="mt-1 text-sm text-ice-300/70">
          Hybrid retrieval — vector similarity fused with Postgres full-text, then re-ranked.
        </p>
      </div>

      <div className="panel space-y-3 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(q);
          }}
          className="flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="sea ice mass balance, black carbon, CTD profiles…"
            className="field"
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Searching" : "Search"}
          </button>
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Station</label>
            <select value={station} onChange={(e) => setStation(e.target.value)} className="field">
              <option value="">All stations</option>
              <option value="maitri">Maitri</option>
              <option value="bharati">Bharati</option>
              <option value="himadri">Himadri</option>
            </select>
          </div>
          <div>
            <label className="label">Document type</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="field">
              <option value="">All types</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {searched && !loading && total === 0 && !error && (
        <Empty>
          No matches for <strong>{result?.query ?? q}</strong>. Try broader wording.
        </Empty>
      )}

      {docs.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
            Documents · {docs.length}
          </h2>
          <div className="space-y-3">
            {docs.map((d) => (
              <article key={d.id} className="panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-ice-50">{d.title}</h3>
                  <div className="flex gap-1.5">
                    {d.matchedBy && <span className="chip">matched: {d.matchedBy}</span>}
                    {typeof d.score === "number" && <span className="chip">{d.score.toFixed(4)}</span>}
                  </div>
                </div>
                {d.snippet && <p className="mt-2 text-xs leading-relaxed text-ice-200/75">{d.snippet}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-ice-300/60">
                  {d.docType && <span className="chip">{d.docType}</span>}
                  {d.station && <Link href={`/stations/${d.station}`} className="chip hover:text-ice-100">{d.station}</Link>}
                  {d.year && <span className="chip">{d.year}</span>}
                  {d.authority && <span className="chip">{d.authority}</span>}
                  {d.license && <span className="chip">{d.license}</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {datasets.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
            Datasets · {datasets.length}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {datasets.map((d) => (
              <div key={d.id} className="panel p-4">
                <h3 className="font-semibold text-ice-50">{d.title}</h3>
                {d.abstract && <p className="mt-1 text-xs text-ice-200/70">{d.abstract}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.format && <span className="chip">{d.format}</span>}
                  {d.variables?.map((v) => (
                    <span key={v} className="chip">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {media.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
            Media · {media.length}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {media.map((m) => (
              <div key={m.id} className="panel p-4">
                <h3 className="font-semibold text-ice-50">{m.title}</h3>
                {m.kind && <span className="chip mt-1">{m.kind}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      <ProvenanceBar p={prov ?? undefined} />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<Loading label="Preparing search" />}>
      <DiscoverInner />
    </Suspense>
  );
}
