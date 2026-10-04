"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useApi, Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar } from "@/components/Provenance";
import type { AnalyticsResult, Dataset, Envelope, Provenance } from "@/lib/types";

const OPS = ["mean", "max", "min", "sum", "trend", "delta"];

/** Minimal dependency-free sparkline. */
function Sparkline({ series }: { series: { ts: string; value: number }[] }) {
  if (series.length < 2) return null;
  const w = 640;
  const h = 140;
  const vals = series.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const pts = series
    .map((p, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((p.value - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="#55a8d8" strokeWidth="2" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill="rgba(47,139,196,0.14)" stroke="none" />
    </svg>
  );
}

export default function DataPage() {
  const { data: datasets, loading, error, provenance } = useApi(() => api.datasets(), []);

  const [selected, setSelected] = useState<string>("");
  const [op, setOp] = useState("mean");
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [resProv, setResProv] = useState<Provenance | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    if (!selected) return;
    setBusy(true);
    setErr(null);
    try {
      const r: Envelope<AnalyticsResult> = await api.analytics(selected, op);
      setResult(r.data);
      setResProv(r.provenance ?? null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ice-50">Data</h1>
        <p className="mt-1 text-sm text-ice-300/70">
          Dataset catalogue with on-demand statistical analysis computed over the stored time series.
        </p>
      </div>

      {loading && <Loading label="Loading datasets" />}
      {error && <ErrorBox message={error} />}

      {datasets && datasets.length > 0 && (
        <section className="panel p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">Analyse a dataset</h2>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
            <div>
              <label className="label">Dataset</label>
              <select value={selected} onChange={(e) => setSelected(e.target.value)} className="field">
                <option value="">Select…</option>
                {datasets.map((d) => (
                  <option key={d.id} value={d.title}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Operation</label>
              <select value={op} onChange={(e) => setOp(e.target.value)} className="field">
                {OPS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn" onClick={run} disabled={!selected || busy}>
                {busy ? "Running" : "Run"}
              </button>
            </div>
          </div>
        </section>
      )}

      {err && <ErrorBox message={err} />}

      {result && (
        <section className="panel p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ice-300/70">
              {result.dataset?.title}
            </h2>
            <span className="chip">{result.op}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-ice-300/60">Result</div>
              <div className="text-3xl font-semibold text-ice-50">
                {typeof result.value === "number" ? result.value.toFixed(4) : "—"}
                {result.dataset?.unit && (
                  <span className="ml-1 text-base font-normal text-ice-300/70">{result.dataset.unit}</span>
                )}
              </div>
            </div>
            {typeof result.delta === "number" && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ice-300/60">Net change</div>
                <div className="text-xl font-semibold text-ice-100">{result.delta.toFixed(4)}</div>
              </div>
            )}
            {typeof result.observations === "number" && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ice-300/60">Observations</div>
                <div className="text-xl font-semibold text-ice-100">{result.observations}</div>
              </div>
            )}
          </div>
          {result.series && <div className="mt-4">{<Sparkline series={result.series} />}</div>}
          {result.range && (
            <div className="mt-2 text-[11px] text-ice-300/60">
              {result.range[0]} → {result.range[1]}
            </div>
          )}
          <ProvenanceBar p={resProv ?? undefined} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
          Catalogue · {datasets?.length ?? 0}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(datasets ?? []).map((d: Dataset) => (
            <div key={d.id} className="panel p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-ice-50">{d.title}</h3>
                <span className="chip">{d.format}</span>
              </div>
              {d.abstract && <p className="mt-1 text-xs leading-relaxed text-ice-200/70">{d.abstract}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.theme && <span className="chip">{d.theme}</span>}
                {d.station && <span className="chip">{d.station}</span>}
                {d.year && <span className="chip">{d.year}</span>}
                {typeof d.rows === "number" && <span className="chip">{d.rows.toLocaleString()} rows</span>}
                {d.sizeLabel && <span className="chip">{d.sizeLabel}</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(d.variables ?? []).map((v) => (
                  <span key={v} className="chip font-mono">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProvenanceBar p={provenance ?? undefined} />
    </div>
  );
}
