"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { useApi, Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar } from "@/components/Provenance";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-[380px] animate-pulse rounded-xl border border-white/10 bg-white/5" />,
});

export default function StationsPage() {
  const stations = useApi(() => api.stations(), []);
  const map = useApi(() => api.mapFeatures(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ice-50">Stations</h1>
        <p className="mt-1 text-sm text-ice-300/70">
          Maitri, Bharati and Himadri — India&apos;s polar research stations.
        </p>
      </div>

      <section>
        {map.loading && <Loading label="Loading map" />}
        {map.data && <MapView fc={map.data} height={380} />}
      </section>

      {stations.loading && <Loading label="Loading stations" />}
      {stations.error && <ErrorBox message={stations.error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(stations.data ?? []).map((s) => (
          <Link key={s.id} href={`/stations/${s.id}`} className="panel p-5 transition hover:bg-white/[0.06]">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-ice-50">{s.name}</h2>
              <span className="chip">{s.region}</span>
            </div>
            {s.stationType && <div className="mt-0.5 text-xs text-ice-300/70">{s.stationType}</div>}
            <p className="mt-2 text-sm leading-relaxed text-ice-200/75">{s.summary}</p>
            <div className="mt-3 text-[11px] text-ice-300/60">
              {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
              {s.established ? ` · established ${s.established}` : ""}
            </div>
          </Link>
        ))}
      </div>

      <ProvenanceBar p={stations.provenance ?? undefined} />
    </div>
  );
}
