"use client";

import { useRef, useState } from "react";
import { api, uploadDocument } from "@/lib/api";
import { useApi, Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar, Stat } from "@/components/Provenance";
import type { Envelope } from "@/lib/types";

type UploadResult = {
  jobId: string;
  documentId: string;
  filename: string;
  chunks: number;
  status: string;
  steps: { step: string; status: string }[];
};

export default function IngestPage() {
  const { data: health, loading, error, provenance, refetch } = useApi(() => api.repositoryHealth(), []);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await uploadDocument<UploadResult>(file);
      setResult(r.data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      refetch();
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
        <h1 className="text-2xl font-semibold tracking-tight text-ice-50">Ingest</h1>
        <p className="mt-1 text-sm text-ice-300/70">
          Upload a PDF or text file. It is extracted, chunked, embedded with MiniLM and indexed into pgvector —
          then held for review before it becomes searchable.
        </p>
      </div>

      <section className="panel p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">Upload</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <label className="label">File (PDF or .txt)</label>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="field file:mr-3 file:rounded file:border-0 file:bg-ice-500/25 file:px-3 file:py-1 file:text-xs file:text-ice-100"
            />
          </div>
          <button className="btn" onClick={submit} disabled={!file || busy}>
            {busy ? "Ingesting…" : "Ingest"}
          </button>
        </div>

        {err && <div className="mt-3"><ErrorBox message={err} /></div>}

        {result && (
          <div className="mt-4 rounded-lg border border-ice-500/30 bg-ice-500/10 p-4">
            <div className="text-sm font-semibold text-ice-50">Ingested {result.filename}</div>
            <div className="mt-1 text-xs text-ice-200/75">
              {result.chunks} chunks · status {result.status} · document {result.documentId.slice(0, 8)}…
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(result.steps ?? []).map((s) => (
                <span key={s.step} className="chip">
                  {s.step.replace(/_/g, " ")}: {s.status}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
          Repository health
        </h2>
        {loading && <Loading label="Reading health" />}
        {error && <ErrorBox message={error} />}
        {health && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Uploaded" value={health.pipeline.uploaded ?? 0} />
              <Stat label="Indexed" value={health.pipeline.indexed ?? 0} />
              <Stat label="Pending review" value={health.pipeline.pendingReview ?? 0} />
              <Stat label="Failed" value={health.pipeline.failed ?? 0} />
            </div>

            <div className="panel mt-3 p-4">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ice-300/70">
                Subsystems
              </h3>
              <dl className="grid gap-2 sm:grid-cols-2">
                {Object.entries(health.health).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-white/5 pb-1.5 text-sm">
                    <dt className="text-ice-300/70">{k.replace(/([A-Z])/g, " $1").toLowerCase()}</dt>
                    <dd className="font-mono text-xs text-ice-100">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <ProvenanceBar p={provenance ?? undefined} />
          </>
        )}
      </section>
    </div>
  );
}
