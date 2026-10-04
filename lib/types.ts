export type Provenance = {
  source: string;
  mode: string;
  generatedAt: string;
  latencyMs?: number;
  model?: string | null;
};

export type Envelope<T> = { data: T; provenance: Provenance };

export type Station = {
  id: string;
  name: string;
  region: string;
  stationType?: string;
  established?: number | null;
  lat: number;
  lon: number;
  summary: string;
  hero_image?: string | null;
  meta?: Record<string, string | number> | null;
  counts?: { documents?: number; datasets?: number; media?: number } | null;
  weatherPreview?: {
    variable: string;
    value: number;
    unit: string;
    observedAt: string;
  } | null;
  documents?: SearchDoc[];
  datasets?: Dataset[];
  media?: MediaItem[];
};

export type TimelineEvent = { date: string; title: string; description: string };

export type Expedition = {
  id: string;
  name: string;
  season: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  summary: string;
  leadInstitution?: string;
  timeline?: TimelineEvent[];
  members?: { name: string; role: string; institution?: string }[];
  documents?: SearchDoc[];
  stats?: Record<string, number> | null;
};

export type SearchDoc = {
  id: string;
  title: string;
  docType?: string;
  station?: string | null;
  year?: number | null;
  snippet?: string;
  score?: number;
  authority?: string;
  license?: string;
  matchedBy?: string;
};

export type Dataset = {
  id: string;
  title: string;
  station?: string | null;
  theme?: string;
  year?: number | null;
  format?: string;
  variables?: string[];
  unit?: string;
  rows?: number;
  sizeLabel?: string;
  abstract?: string;
  span?: string;
};

export type MediaItem = {
  id: string;
  title: string;
  kind?: string;
  station?: string | null;
  year?: number | null;
  description?: string;
  thumb?: string | null;
  license?: string;
};

export type SearchResult = {
  query: string;
  documents: SearchDoc[];
  datasets?: Dataset[];
  media?: MediaItem[];
  total?: number;
  mode?: string;
};

export type Citation = {
  index: number;
  id: string;
  title: string;
  docType?: string;
  station?: string | null;
  year?: number | null;
  snippet?: string;
  score?: number;
  authority?: string;
  license?: string;
};

export type AIAnswer = {
  answer: string;
  citations: Citation[];
  passages?: { index: number; text: string; title?: string }[];
  passageCount?: number;
  generator?: string;
  steps?: { step: string; status: string }[];
  mode?: string;
  /** Knowledge-graph neighbours: { id, label, kind, relation, from } */
  related?: { id: string; label: string; kind?: string; relation?: string; from?: string }[];
};

export type OutreachPost = {
  id: string;
  sourceId?: string | null;
  sourceTitle?: string | null;
  audience?: string;
  language?: string;
  format?: string;
  content?: string;
  stage?: string;
  claims?: { text: string; citation?: string }[] | string[];
  createdAt?: string;
};

export type RepoHealth = {
  kpis: Record<string, number>;
  pipeline: Record<string, number>;
  health: Record<string, string>;
};

export type AnalyticsResult = {
  dataset?: {
    id: string;
    title: string;
    station?: string | null;
    theme?: string;
    year?: number | null;
    unit?: string;
    license?: string;
    authority?: string;
  };
  variable?: string;
  op?: string;
  value?: number | null;
  delta?: number | null;
  observations?: number;
  series?: { ts: string; value: number }[];
  range?: string[];
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: { type: string; coordinates: number[] | number[][] };
  }[];
};
