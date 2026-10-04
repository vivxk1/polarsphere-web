"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useApi, Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar, Stat } from "@/components/Provenance";

const EXAMPLES = [
  "maximum sea ice thickness at Prydz Bay",
  "black carbon measurements at Maitri",
  "ice shelf thinning near Larsemann Hills",
  "permafrost thermal state at Ny-Alesund",
];

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const health = useApi(() => api.repositoryHealth(), []);
  const stations = useApi(() => api.stations(), []);
  const expeditions = useApi(() => api.expeditions(), []);

  const submit = (value: string) => {
    const t = value.trim();
    if (!t) return;
    router.push(`/polar-ai?q=${encodeURIComponent(t)}`);
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="panel relative overflow-hidden p-8">
        <div className="max-w-2xl">
          <span className="chip">SIH 2026 · PS 26063 · MoES / NCPOR</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ice-50">
            Every polar expedition record,
            <br />
            <span className="text-ice-300">searchable and answerable.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ice-200/75">
            PolarSphere 360 ingests expedition reports, datasets and media into a single index, then answers
            questions over them with citations back to the source. Retrieval is hybrid — pgvector similarity
            fused with Postgres full-text search.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
            className="mt-6 flex gap-2"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask about sea ice, black carbon, bathymetry…"
              className="field"
            />
            <button className="btn" type="submit">
              Ask
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} onClick={() => submit(e)} className="btn-ghost text-xs">
                {e}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
          Repository health
        </h2>
        {health.error && <ErrorBox message={health.error} />}
        {health.loading && <Loading label="Reading repository health" />}
        {health.data && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Documents" value={health.data.kpis.documents ?? 0} />
              <Stat label="Indexed chunks" value={health.data.kpis.chunks ?? 0} />
              <Stat label="Datasets" value={health.data.kpis.datasets ?? 0} />
              <Stat label="Media" value={health.data.kpis.media ?? 0} />
              <Stat
                label="Index coverage"
                value={`${Math.round((health.data.kpis.indexCoverage ?? 0) * 100)}%`}
              />
              <Stat label="KG nodes" value={health.data.kpis.knowledgeNodes ?? 0} />
              <Stat label="Posts in review" value={health.data.kpis.postsInReview ?? 0} />
              <Stat label="Field queue" value={health.data.kpis.observationsQueued ?? 0} />
            </div>
            <ProvenanceBar p={health.provenance ?? undefined} />
          </>
        )}
      </section>

      {/* Stations */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ice-300/70">Stations</h2>
          <Link href="/stations" className="text-xs text-ice-300 hover:text-ice-100">
            View all →
          </Link>
        </div>
        {stations.loading && <Loading label="Loading stations" />}
        {stations.error && <ErrorBox message={stations.error} />}
        <div className="grid gap-3 sm:grid-cols-3">
          {(stations.data ?? []).map((s) => (
            <Link key={s.id} href={`/stations/${s.id}`} className="panel p-4 transition hover:bg-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ice-50">{s.name}</h3>
                <span className="chip">{s.region}</span>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ice-200/70">{s.summary}</p>
              <div className="mt-3 text-[11px] text-ice-300/60">
                {s.lat.toFixed(3)}, {s.lon.toFixed(3)}
                {s.established ? ` · est. ${s.established}` : ""}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Expeditions */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ice-300/70">Expeditions</h2>
          <Link href="/expeditions" className="text-xs text-ice-300 hover:text-ice-100">
            View all →
          </Link>
        </div>
        {expeditions.loading && <Loading label="Loading expeditions" />}
        {expeditions.error && <ErrorBox message={expeditions.error} />}
        <div className="grid gap-3 sm:grid-cols-2">
          {(expeditions.data ?? []).map((e) => (
            <Link key={e.id} href={`/expeditions/${e.id}`} className="panel p-4 transition hover:bg-white/[0.06]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-ice-50">{e.name}</h3>
                <span className="chip">{e.status}</span>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ice-200/70">{e.summary}</p>
              <div className="mt-3 text-[11px] text-ice-300/60">
                {e.season}
                {e.startDate ? ` · ${e.startDate} → ${e.endDate}` : ""}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
