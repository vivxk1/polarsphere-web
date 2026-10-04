"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useApi, Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar, Empty } from "@/components/Provenance";
import type { Envelope, OutreachPost } from "@/lib/types";

const STAGES = ["DRAFT", "SCIENTIST_REVIEW", "COMMUNICATION_REVIEW", "APPROVED", "PUBLISHED"];
const FORMATS = ["Blog Post", "Social Caption", "Press Note", "Newsletter"];

function StageTrack({ stage }: { stage?: string }) {
  const idx = stage ? STAGES.indexOf(stage) : -1;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {STAGES.map((s, i) => (
        <span key={s} className="flex items-center gap-1">
          <span
            className={`chip ${
              i <= idx ? "border-ice-400/40 bg-ice-500/25 text-ice-100" : "opacity-40"
            }`}
          >
            {s.replace(/_/g, " ")}
          </span>
          {i < STAGES.length - 1 && <span className="text-ice-300/30">→</span>}
        </span>
      ))}
    </div>
  );
}

export default function OutreachPage() {
  const { data: posts, loading, error, provenance, refetch } = useApi(() => api.outreachList(), []);

  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Blog Post");
  const [audience, setAudience] = useState("General Public");
  const [draft, setDraft] = useState<OutreachPost | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r: Envelope<OutreachPost> = await api.outreachGenerate({
        audience,
        format,
        language: "en",
        tone: topic.trim() || undefined,
      });
      setDraft(r.data);
      refetch();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const advance = async (post: OutreachPost) => {
    const current = post.stage ?? "DRAFT";
    const idx = STAGES.indexOf(current);
    const target = STAGES[Math.min(idx + 1, STAGES.length - 1)];
    if (target === current) return;
    setAdvancing(post.id);
    setErr(null);
    try {
      await api.outreachApprove(post.id, target, "demo-reviewer");
      refetch();
      if (draft?.id === post.id) setDraft({ ...post, stage: target });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setAdvancing(null);
    }
  };

  const all = [draft, ...(posts ?? []).filter((p) => p.id !== draft?.id)].filter(Boolean) as OutreachPost[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ice-50">Outreach</h1>
        <p className="mt-1 text-sm text-ice-300/70">
          AI drafts public-facing content from a source document, then a human moves it through five approval
          stages. Nothing publishes without sign-off.
        </p>
      </div>

      <section className="panel space-y-3 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ice-300/70">Generate a draft</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label">Topic hint (optional)</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="sea ice decline"
              className="field"
            />
          </div>
          <div>
            <label className="label">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="field">
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Audience</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="field">
              <option>General Public</option>
              <option>Students</option>
              <option>Press</option>
              <option>Policymakers</option>
            </select>
          </div>
        </div>
        <button className="btn" onClick={generate} disabled={busy}>
          {busy ? "Generating…" : "Generate"}
        </button>
        {busy && <div className="text-xs text-ice-300/60">Generating with the local model — ~10 s.</div>}
      </section>

      {err && <ErrorBox message={err} />}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
          Posts · {all.length}
        </h2>
        {loading && <Loading label="Loading posts" />}
        {error && <ErrorBox message={error} />}
        {!loading && all.length === 0 && <Empty>No posts yet — generate one above.</Empty>}

        <div className="space-y-3">
          {all.map((p) => (
            <article key={p.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-ice-50">{p.sourceTitle ?? "Untitled source"}</h3>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.format && <span className="chip">{p.format}</span>}
                    {p.audience && <span className="chip">{p.audience}</span>}
                    {p.language && <span className="chip">{p.language}</span>}
                  </div>
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => advance(p)}
                  disabled={advancing === p.id || p.stage === "PUBLISHED"}
                >
                  {p.stage === "PUBLISHED" ? "Published" : advancing === p.id ? "Advancing…" : "Advance stage →"}
                </button>
              </div>

              <div className="mt-3">
                <StageTrack stage={p.stage} />
              </div>

              {p.content && (
                <div className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/25 p-3 text-sm leading-relaxed text-ice-100">
                  {p.content}
                </div>
              )}

              {p.claims && p.claims.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ice-300/70">
                    Claims grounded in source · {p.claims.length}
                  </div>
                  <ul className="space-y-1 text-xs text-ice-200/75">
                    {p.claims.map((c, i) => (
                      <li key={i}>• {typeof c === "string" ? c : c.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <ProvenanceBar p={provenance ?? undefined} />
    </div>
  );
}
