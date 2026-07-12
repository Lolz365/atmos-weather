'use client';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function getCached<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // quota exceeded, ignore
  }
}

export function weatherCacheKey(lat: number, lon: number, units: string): string {
  return `atmos_weather_${lat.toFixed(4)}_${lon.toFixed(4)}_${units}`;
}

export function forecastCacheKey(lat: number, lon: number, units: string): string {
  return `atmos_forecast_${lat.toFixed(4)}_${lon.toFixed(4)}_${units}`;
}
