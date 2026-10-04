"use client";

import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useApi, Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar, Stat } from "@/components/Provenance";

export default function StationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { data: s, provenance, loading, error } = useApi(() => api.station(id), [id]);

  return (
    <div className="space-y-6">
      {loading && <Loading label="Loading station" />}
      {error && <ErrorBox message={error} />}

      {s && (
        <>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ice-50">{s.name}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="chip">{s.region}</span>
              {s.stationType && <span className="chip">{s.stationType}</span>}
              {s.established && <span className="chip">est. {s.established}</span>}
              <span className="chip font-mono">
                {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ice-200/75">{s.summary}</p>
          </div>

          {s.counts && (
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Documents" value={s.counts.documents ?? 0} />
              <Stat label="Datasets" value={s.counts.datasets ?? 0} />
              <Stat label="Media" value={s.counts.media ?? 0} />
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {s.weatherPreview && (
              <section className="panel p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-ice-300/70">
                  Latest observation
                </h2>
                <div className="mt-3 text-3xl font-semibold text-ice-50">
                  {s.weatherPreview.value.toFixed(2)}
                  <span className="ml-1 text-base font-normal text-ice-300/70">{s.weatherPreview.unit}</span>
                </div>
                <div className="mt-1 text-xs text-ice-300/60">
                  {s.weatherPreview.variable.replace(/_/g, " ")} · {s.weatherPreview.observedAt}
                </div>
              </section>
            )}

            {s.meta && (
              <section className="panel p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-ice-300/70">Station facts</h2>
                <dl className="mt-3 space-y-2 text-sm">
                  {Object.entries(s.meta).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-white/5 pb-1.5">
                      <dt className="text-ice-300/70">{k.replace(/([A-Z])/g, " $1").toLowerCase()}</dt>
                      <dd className="font-medium text-ice-50">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>

          {s.datasets && s.datasets.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
                Datasets · {s.datasets.length}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {s.datasets.map((d) => (
                  <div key={d.id} className="panel p-3">
                    <div className="text-sm font-medium text-ice-50">{d.title}</div>
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

          {s.documents && s.documents.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
                Documents · {s.documents.length}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {s.documents.map((d) => (
                  <div key={d.id} className="panel p-3">
                    <div className="text-sm font-medium text-ice-50">{d.title}</div>
                    {d.snippet && <p className="mt-1 line-clamp-2 text-xs text-ice-200/70">{d.snippet}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <ProvenanceBar p={provenance ?? undefined} />
        </>
      )}
    </div>
  );
}
