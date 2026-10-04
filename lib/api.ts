import type {
  AIAnswer,
  AnalyticsResult,
  Dataset,
  Envelope,
  Expedition,
  FeatureCollection,
  MediaItem,
  OutreachPost,
  RepoHealth,
  SearchResult,
  Station,
} from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {
      /* keep status text */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<Envelope<T>>;
}

export async function getJSON<T>(path: string): Promise<Envelope<T>> {
  return request<T>(path);
}

export async function postJSON<T>(path: string, body: unknown): Promise<Envelope<T>> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

/* ---------- endpoints ---------- */

export const api = {
  health: () => getJSON<Record<string, string>>("/health"),
  expeditions: () => getJSON<Expedition[]>("/api/expeditions"),
  expedition: (id: string) => getJSON<Expedition>(`/api/expeditions/${id}`),
  stations: () => getJSON<Station[]>("/api/stations"),
  station: (id: string) => getJSON<Station>(`/api/stations/${id}`),
  mapFeatures: () => getJSON<FeatureCollection>("/api/map/features"),
  datasets: (station?: string) =>
    getJSON<Dataset[]>(`/api/datasets${station ? `?station=${station}` : ""}`),
  media: (station?: string) => getJSON<MediaItem[]>(`/api/media${station ? `?station=${station}` : ""}`),
  search: (q: string, opts: { limit?: number; station?: string; docType?: string } = {}) =>
    postJSON<SearchResult>("/api/search", { q, limit: opts.limit ?? 10, ...opts }),
  ask: (q: string, top_k = 5) => postJSON<AIAnswer>("/api/ai/query", { q, top_k }),
  analytics: (dataset: string, op = "mean", range?: string) =>
    postJSON<AnalyticsResult>("/api/ai/analytics", { dataset, op, range }),
  outreachList: () => getJSON<OutreachPost[]>("/api/outreach"),
  outreachGenerate: (body: { sourceId?: string; audience?: string; format?: string; language?: string; tone?: string }) =>
    postJSON<OutreachPost>("/api/outreach/generate", body),
  outreachApprove: (id: string, stage: string, reviewer = "reviewer") =>
    postJSON<OutreachPost & { nextStage?: string }>(`/api/outreach/${id}/approve`, { stage, reviewer }),
  repositoryHealth: () => getJSON<RepoHealth>("/api/admin/repository-health"),
};

export async function uploadDocument<T = Record<string, unknown>>(file: File): Promise<Envelope<T>> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/documents/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<Envelope<T>>;
}
