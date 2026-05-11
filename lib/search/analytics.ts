import { MAX_TOP_KEYWORDS } from './constants';

type Metrics = {
  totalSearches: number;
  totalLatencyMs: number;
  topKeywords: Map<string, number>;
};

const metrics: Metrics = {
  totalSearches: 0,
  totalLatencyMs: 0,
  topKeywords: new Map(),
};

export const recordSearch = (q?: string, latencyMs?: number) => {
  metrics.totalSearches += 1;

  if (typeof latencyMs === 'number' && !Number.isNaN(latencyMs)) {
    metrics.totalLatencyMs += latencyMs;
  }

  const key = (q || '').trim().toLowerCase();

  if (key) {
    metrics.topKeywords.set(key, (metrics.topKeywords.get(key) || 0) + 1);
  }
};

// can be used in potential /api/analytics
export const getMetrics = () => {
  const sortedTop = Array.from(metrics.topKeywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_TOP_KEYWORDS)
    .map(([term, count]) => ({ term, count }));
  const avgLatency = metrics.totalSearches ? metrics.totalLatencyMs / metrics.totalSearches : 0;

  return { totalSearches: metrics.totalSearches, avgLatencyMs: avgLatency, topKeywords: sortedTop };
};
