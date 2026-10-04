import type { Provenance } from "@/lib/types";

export function ProvenanceBar({ p }: { p?: Provenance }) {
  if (!p) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ice-300/60">
      <span className="chip">source: {p.source}</span>
      <span className="chip">mode: {p.mode}</span>
      {typeof p.latencyMs === "number" && <span className="chip">{p.latencyMs} ms</span>}
      {p.model && <span className="chip">{p.model}</span>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="panel p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ice-300/70">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ice-50">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ice-300/60">{sub}</div>}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel p-6 text-sm text-ice-300/70">
      {children}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
      <strong className="font-semibold">Request failed:</strong> {message}
      <div className="mt-1 text-xs text-red-200/70">
        Is the API running? <code className="font-mono">uvicorn app.main:app --port 8000</code>
      </div>
    </div>
  );
}

export default ProvenanceBar;
