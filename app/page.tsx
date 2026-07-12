'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GeoLocation, CurrentWeather, ForecastData, Units } from '@/lib/types';
import { getCached, setCached, weatherCacheKey, forecastCacheKey } from '@/lib/cache';
import { Header } from '@/components/weather/Header';
import { SearchBar } from '@/components/weather/SearchBar';
import { MainWeatherCard } from '@/components/weather/MainWeatherCard';
import { MetricsGrid } from '@/components/weather/MetricsGrid';
import { HourlyForecastRow } from '@/components/weather/HourlyForecastRow';
import { DailyForecastList } from '@/components/weather/DailyForecastList';
import { SkeletonCard } from '@/components/weather/SkeletonCard';
import { ErrorState } from '@/components/weather/ErrorState';

const DEFAULT_LOCATION: GeoLocation = {
  name: 'Fort Worth',
  lat: 32.7254,
  lon: -97.3208,
  country: 'US',
  state: 'Texas',
  displayName: 'Fort Worth, Texas, US',
};

const PERSIST_LOCATION_KEY = 'atmos_last_location';
const PERSIST_UNITS_KEY = 'atmos_units';

export default function Home() {
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [units, setUnits] = useState<Units>('imperial');
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [forecastUnavailable, setForecastUnavailable] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore persisted settings
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem(PERSIST_LOCATION_KEY);
      const savedUnits = localStorage.getItem(PERSIST_UNITS_KEY) as Units | null;
      if (savedLoc) setLocation(JSON.parse(savedLoc));
      if (savedUnits === 'metric' || savedUnits === 'imperial') setUnits(savedUnits);
    } catch {}
    setHydrated(true);
  }, []);

  const fetchWeather = useCallback(async (loc: GeoLocation, u: Units) => {
    setLoading(true);
    setError(null);

    const cKey = weatherCacheKey(loc.lat, loc.lon, u);
    const cached = getCached<CurrentWeather>(cKey);
    if (cached) {
      setCurrent(cached);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}&units=${u}&type=current`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Weather fetch failed');
      setCurrent(data);
      setCached(cKey, data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchForecast = useCallback(async (loc: GeoLocation, u: Units) => {
    setForecastLoading(true);
    setForecastError(null);
    setForecastUnavailable(false);

    const cKey = forecastCacheKey(loc.lat, loc.lon, u);
    const cached = getCached<ForecastData>(cKey);
    if (cached) {
      setForecast(cached);
      setForecastLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}&units=${u}&type=forecast`);
      const data = await res.json();
      if (res.status === 403 || data.error === 'ONECALL_UNAVAILABLE') {
        setForecastUnavailable(true);
        setForecastLoading(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Forecast fetch failed');
      setForecast(data);
      setCached(cKey, data);
    } catch (err: unknown) {
      setForecastError(err instanceof Error ? err.message : 'Failed to load forecast');
    } finally {
      setForecastLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    fetchWeather(location, units);
    fetchForecast(location, units);
  }, [location, units, hydrated, fetchWeather, fetchForecast]);

  const handleLocationSelect = (loc: GeoLocation) => {
    setLocation(loc);
    try { localStorage.setItem(PERSIST_LOCATION_KEY, JSON.stringify(loc)); } catch {}
  };

  const handleUnitsChange = (u: Units) => {
    setUnits(u);
    try { localStorage.setItem(PERSIST_UNITS_KEY, u); } catch {}
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/geocode?q=${latitude},${longitude}`);
          const data = await res.json();
          if (data && Array.isArray(data) && data.length > 0) {
            handleLocationSelect(data[0]);
          } else {
            // Fallback: use coords directly
            const loc: GeoLocation = {
              name: 'Current Location',
              lat: latitude,
              lon: longitude,
              country: '',
              displayName: 'Current Location',
            };
            handleLocationSelect(loc);
          }
        } catch {
          const loc: GeoLocation = {
            name: 'Current Location',
            lat: latitude,
            lon: longitude,
            country: '',
            displayName: 'Current Location',
          };
          handleLocationSelect(loc);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          alert('Location access was denied. Please allow location access in your browser settings.');
        } else {
          alert('Unable to get your location. Please try again.');
        }
      }
    );
  };

  const handleRetry = () => {
    fetchWeather(location, units);
    fetchForecast(location, units);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Header
          units={units}
          onUnitsChange={handleUnitsChange}
          onGeolocate={handleGeolocate}
        />

        <SearchBar onSelect={handleLocationSelect} />

        {error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : loading ? (
          <SkeletonCard />
        ) : current ? (
          <>
            <MainWeatherCard weather={current} units={units} locationName={location.displayName} />
            <MetricsGrid weather={current} units={units} />
          </>
        ) : null}

        {/* Forecast section */}
        {!error && !loading && current && (
          <>
            {forecastUnavailable && (
              <div className="rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-slate-200/60 dark:border-slate-700/60 px-5 py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  📊 <strong>Enhanced forecast unavailable</strong> — Hourly and daily forecasts require the OpenWeather One Call API 3.0, which needs a separate subscription. Current weather and search remain fully functional.
                </p>
              </div>
            )}

            {forecastLoading && !forecastUnavailable && (
              <div className="space-y-4">
                <div className="skeleton h-32 rounded-2xl" />
                <div className="skeleton h-64 rounded-2xl" />
              </div>
            )}

            {forecastError && !forecastUnavailable && (
              <div className="rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-red-200/60 dark:border-red-800/60 px-5 py-4">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Forecast error: {forecastError}
                </p>
              </div>
            )}

            {forecast && !forecastUnavailable && (
              <>
                <HourlyForecastRow
                  hourly={forecast.hourly}
                  timezoneOffset={forecast.timezoneOffset}
                  units={units}
                />
                <DailyForecastList
                  daily={forecast.daily}
                  timezoneOffset={forecast.timezoneOffset}
                  units={units}
                />
              </>
            )}
          </>
        )}

        <footer className="text-center text-xs text-slate-400 dark:text-slate-600 py-4">
          Powered by{' '}
          <a
            href="https://openweathermap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            OpenWeather
          </a>
        </footer>
      </div>
    </div>
  );
}
