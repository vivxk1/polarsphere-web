"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useApi, Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar } from "@/components/Provenance";

export default function ExpeditionsPage() {
  const { data, provenance, loading, error } = useApi(() => api.expeditions(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ice-50">Expeditions</h1>
        <p className="mt-1 text-sm text-ice-300/70">
          Indian Scientific Expeditions to Antarctica, with timelines, members and linked outputs.
        </p>
      </div>

      {loading && <Loading label="Loading expeditions" />}
      {error && <ErrorBox message={error} />}

      <div className="grid gap-4">
        {(data ?? []).map((e) => (
          <Link key={e.id} href={`/expeditions/${e.id}`} className="panel p-5 transition hover:bg-white/[0.06]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-ice-50">{e.name}</h2>
              <span className="chip">{e.status}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ice-200/75">{e.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              <span className="chip">{e.season}</span>
              {e.leadInstitution && <span className="chip">{e.leadInstitution}</span>}
              {e.startDate && (
                <span className="chip">
                  {e.startDate} → {e.endDate}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <ProvenanceBar p={provenance ?? undefined} />
    </div>
  );
}
