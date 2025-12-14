const STORAGE_KEY = 'ai-cost-estimator-pricing-meta';
const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface PricingMetadata {
  lastUpdate: string | null;
  lastCheckTimestamp: number | null;
}

export function getPricingMetadata(): PricingMetadata {
  if (typeof window === 'undefined') {
    return { lastUpdate: null, lastCheckTimestamp: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }

  return { lastUpdate: null, lastCheckTimestamp: null };
}

export function setPricingMetadata(metadata: Partial<PricingMetadata>): void {
  if (typeof window === 'undefined') return;

  const current = getPricingMetadata();
  const updated = { ...current, ...metadata };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export function markPricingUpdated(): void {
  setPricingMetadata({
    lastUpdate: new Date().toISOString(),
    lastCheckTimestamp: Date.now(),
  });
}

export function shouldAutoUpdate(): boolean {
  const metadata = getPricingMetadata();

  if (!metadata.lastCheckTimestamp) {
    return true;
  }

  const timeSinceLastCheck = Date.now() - metadata.lastCheckTimestamp;
  return timeSinceLastCheck >= UPDATE_INTERVAL_MS;
}

export function formatLastUpdate(): string {
  const metadata = getPricingMetadata();

  if (!metadata.lastUpdate) {
    return 'Never';
  }

  const date = new Date(metadata.lastUpdate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}
