"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Loading } from "@/lib/useApi";
import { ErrorBox, ProvenanceBar } from "@/components/Provenance";
import type { AIAnswer, Citation, Provenance } from "@/lib/types";

type Turn = {
  q: string;
  loading: boolean;
  answer?: AIAnswer;
  error?: string;
  provenance?: Provenance | null;
};

/** Renders [1] [2] markers in the answer as links to the citation list. */
function AnswerText({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ice-100">
      {parts.map((p, i) =>
        /^\[\d+\]$/.test(p) ? (
          <a
            key={i}
            href={`#citation-${p.slice(1, -1)}`}
            className="mx-0.5 rounded bg-ice-500/25 px-1 text-xs font-semibold text-ice-200 hover:bg-ice-500/40"
          >
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  );
}

function CitationCard({ c }: { c: Citation }) {
  return (
    <div id={`citation-${c.index}`} className="panel scroll-mt-24 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-ice-500/25 text-[11px] font-bold text-ice-200">
          {c.index}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-ice-50">{c.title}</div>
          {c.snippet && <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ice-200/70">{c.snippet}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            {c.docType && <span className="chip">{c.docType}</span>}
            {c.station && <span className="chip">{c.station}</span>}
            {c.year && <span className="chip">{c.year}</span>}
            {c.authority && <span className="chip">{c.authority}</span>}
            {c.license && <span className="chip">{c.license}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PolarAIInner() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const [turns, setTurns] = useState<Turn[]>([]);
  const bottom = useRef<HTMLDivElement | null>(null);

  const ask = async (value: string) => {
    const term = value.trim();
    if (!term) return;
    setTurns((t) => [...t, { q: term, loading: true }]);
    try {
      const r = await api.ask(term, 5);
      setTurns((t) =>
        t.map((x, i) => (i === t.length - 1 ? { ...x, loading: false, answer: r.data, provenance: r.provenance } : x)),
      );
    } catch (e: unknown) {
      setTurns((t) =>
        t.map((x, i) =>
          i === t.length - 1 ? { ...x, loading: false, error: e instanceof Error ? e.message : String(e) } : x,
        ),
      );
    }
  };

  useEffect(() => {
    if (initialQ) ask(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ice-50">Polar AI</h1>
        <p className="mt-1 text-sm text-ice-300/70">
          Retrieval-augmented answers grounded in the indexed corpus. Every claim links back to a source
          passage — nothing is generated from model memory alone.
        </p>
      </div>

      {turns.map((t, i) => (
        <section key={i} className="space-y-3">
          <div className="panel border-ice-500/30 bg-ice-500/10 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ice-300/70">Question</div>
            <div className="mt-1 text-sm text-ice-50">{t.q}</div>
          </div>

          {t.loading && (
            <div className="panel flex items-center gap-3 p-4 text-sm text-ice-300/70">
              <span className="h-3 w-3 animate-pulse rounded-full bg-ice-400" />
              Retrieving passages and generating…
              <span className="text-[11px] text-ice-300/50">(first query may take ~10 s)</span>
            </div>
          )}

          {t.error && <ErrorBox message={t.error} />}

          {t.answer && (
            <>
              <div className="panel p-4">
                <AnswerText text={t.answer.answer} />

                {t.answer.steps && t.answer.steps.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.answer.steps.map((s) => (
                      <span key={s.step} className="chip">
                        {s.step.replace(/_/g, " ")}: {s.status}
                      </span>
                    ))}
                  </div>
                )}

                {t.answer.generator && (
                  <div className="mt-3 text-[11px] text-ice-300/60">generator: {t.answer.generator}</div>
                )}
                <ProvenanceBar p={t.provenance ?? undefined} />
              </div>

              {t.answer.citations?.length > 0 && (
                <div>
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
                    Sources · {t.answer.citations.length}
                  </h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {t.answer.citations.map((c) => (
                      <CitationCard key={`${i}-${c.index}`} c={c} />
                    ))}
                  </div>
                </div>
              )}

              {t.answer.related && t.answer.related.length > 0 && (
                <div>
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ice-300/70">
                    Related entities
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {t.answer.related.map((r) => (
                      <Link
                        key={r.id}
                        href={`/discover?q=${encodeURIComponent(r.label)}`}
                        className="btn-ghost text-xs"
                      >
                        {r.label}
                        {r.kind && <span className="text-ice-300/50">· {r.kind}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
          setQ("");
        }}
        className="panel sticky bottom-4 flex gap-2 p-3"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask a question about the polar corpus…"
          className="field"
        />
        <button className="btn" type="submit">
          Ask
        </button>
      </form>
      <div ref={bottom} />
    </div>
  );
}

export default function PolarAIPage() {
  return (
    <Suspense fallback={<Loading label="Preparing Polar AI" />}>
      <PolarAIInner />
    </Suspense>
  );
}
