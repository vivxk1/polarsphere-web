"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useApi, Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar, Stat } from "@/components/Provenance";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-[380px] animate-pulse rounded-xl border border-white/10 bg-white/5" />,
});

export default function ExpeditionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const expedition = useApi(() => api.expedition(id), [id]);
  const map = useApi(() => api.mapFeatures(), []);

  const e = expedition.data;

  return (
    <div className="space-y-6">
      {expedition.loading && <Loading label="Loading expedition" />}
      {expedition.error && <ErrorBox message={expedition.error} />}

      {e && (
        <>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ice-50">{e.name}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="chip">{e.season}</span>
              <span className="chip">{e.status}</span>
              {e.leadInstitution && <span className="chip">{e.leadInstitution}</span>}
              {e.startDate && (
                <span className="chip">
                  {e.startDate} → {e.endDate}
                </span>
              )}
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ice-200/75">{e.summary}</p>
          </div>

          {e.stats && Object.keys(e.stats).length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(e.stats).map(([k, v]) => (
                <Stat key={k} label={k.replace(/_/g, " ")} value={v} />
              ))}
            </div>
          )}

          {e.timeline && e.timeline.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">Timeline</h2>
              <ol className="relative space-y-4 border-l border-white/15 pl-5">
                {e.timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-ice-400 bg-[#08131f]" />
                    <div className="text-[11px] font-mono text-ice-300/70">{t.date}</div>
                    <div className="font-medium text-ice-50">{t.title}</div>
                    <p className="mt-0.5 text-xs leading-relaxed text-ice-200/70">{t.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {e.members && e.members.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
                Team · {e.members.length}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {e.members.map((m, i) => (
                  <div key={i} className="panel p-3">
                    <div className="text-sm font-medium text-ice-50">{m.name}</div>
                    <div className="text-xs text-ice-300/70">{m.role}</div>
                    {m.institution && <div className="text-[11px] text-ice-300/50">{m.institution}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">Route</h2>
            {map.loading && <Loading label="Loading map features" />}
            {map.data && <MapView fc={map.data} height={380} />}
          </section>

          {e.documents && e.documents.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
                Linked outputs · {e.documents.length}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {e.documents.map((d) => (
                  <div key={d.id} className="panel p-3">
                    <div className="text-sm font-medium text-ice-50">{d.title}</div>
                    {d.snippet && <p className="mt-1 line-clamp-2 text-xs text-ice-200/70">{d.snippet}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <ProvenanceBar p={expedition.provenance ?? undefined} />
        </>
      )}
    </div>
  );
}
