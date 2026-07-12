import type {
  OWGeoResult,
  OWCurrentWeather,
  OWOneCallResponse,
  GeoLocation,
  CurrentWeather,
  ForecastData,
  HourlyForecast,
  DailyForecast,
} from './types';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org';

function ensureKey(): string {
  if (!API_KEY) throw new Error('OPENWEATHER_API_KEY is not configured');
  return API_KEY;
}

export async function geocodeCity(query: string): Promise<GeoLocation[]> {
  const key = ensureKey();
  const url = `${BASE}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${key}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid API key');
    throw new Error(`Geocoding failed: ${res.status}`);
  }
  const data: OWGeoResult[] = await res.json();
  return data.map(normalizeGeoResult);
}

export async function getCurrentWeather(
  lat: number,
  lon: number,
  units: 'imperial' | 'metric' = 'imperial'
): Promise<CurrentWeather> {
  const key = ensureKey();
  const url = `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${key}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid API key');
    if (res.status === 404) throw new Error('Location not found');
    if (res.status === 429) throw new Error('API rate limit exceeded. Please try again later.');
    throw new Error(`Weather fetch failed: ${res.status}`);
  }
  const data: OWCurrentWeather = await res.json();
  return normalizeCurrentWeather(data);
}

export async function getOneCallForecast(
  lat: number,
  lon: number,
  units: 'imperial' | 'metric' = 'imperial'
): Promise<ForecastData> {
  const key = ensureKey();
  const url = `${BASE}/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,alerts&appid=${key}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    if (res.status === 401) throw new Error('ONECALL_UNAVAILABLE');
    if (res.status === 403) throw new Error('ONECALL_UNAVAILABLE');
    if (res.status === 429) throw new Error('API rate limit exceeded');
    throw new Error(`Forecast fetch failed: ${res.status}`);
  }
  const data: OWOneCallResponse = await res.json();
  return normalizeForecast(data);
}

// --- Normalizers ---

function normalizeGeoResult(r: OWGeoResult): GeoLocation {
  const parts = [r.name];
  if (r.state) parts.push(r.state);
  parts.push(r.country);
  return {
    name: r.name,
    lat: r.lat,
    lon: r.lon,
    country: r.country,
    state: r.state,
    displayName: parts.join(', '),
  };
}

function normalizeCurrentWeather(d: OWCurrentWeather): CurrentWeather {
  const w = d.weather[0];
  return {
    locationName: d.name,
    lat: d.coord.lat,
    lon: d.coord.lon,
    dt: d.dt,
    timezoneOffset: d.timezone,
    temp: d.main.temp,
    feelsLike: d.main.feels_like,
    tempMin: d.main.temp_min,
    tempMax: d.main.temp_max,
    humidity: d.main.humidity,
    pressure: d.main.pressure,
    visibility: d.visibility,
    windSpeed: d.wind.speed,
    windDeg: d.wind.deg,
    windGust: d.wind.gust,
    sunrise: d.sys.sunrise,
    sunset: d.sys.sunset,
    conditionId: w.id,
    conditionMain: w.main,
    conditionDescription: w.description,
    conditionIcon: w.icon,
    clouds: d.clouds.all,
    rain1h: d.rain?.['1h'],
    snow1h: d.snow?.['1h'],
  };
}

function normalizeForecast(d: OWOneCallResponse): ForecastData {
  const hourly: HourlyForecast[] = d.hourly.slice(0, 24).map((h) => ({
    dt: h.dt,
    temp: h.temp,
    feelsLike: h.feels_like,
    humidity: h.humidity,
    windSpeed: h.wind_speed,
    windDeg: h.wind_deg,
    conditionId: h.weather[0].id,
    conditionMain: h.weather[0].main,
    conditionDescription: h.weather[0].description,
    conditionIcon: h.weather[0].icon,
    pop: h.pop,
    rain1h: h.rain?.['1h'],
    snow1h: h.snow?.['1h'],
    uvi: h.uvi,
  }));

  const daily: DailyForecast[] = d.daily.slice(0, 7).map((day) => ({
    dt: day.dt,
    sunrise: day.sunrise,
    sunset: day.sunset,
    tempDay: day.temp.day,
    tempNight: day.temp.night,
    tempMin: day.temp.min,
    tempMax: day.temp.max,
    tempMorn: day.temp.morn,
    tempEve: day.temp.eve,
    feelsLikeDay: day.feels_like.day,
    humidity: day.humidity,
    windSpeed: day.wind_speed,
    windDeg: day.wind_deg,
    conditionId: day.weather[0].id,
    conditionMain: day.weather[0].main,
    conditionDescription: day.weather[0].description,
    conditionIcon: day.weather[0].icon,
    pop: day.pop,
    rain: day.rain,
    snow: day.snow,
    uvi: day.uvi,
    clouds: day.clouds,
  }));

  return { hourly, daily, timezoneOffset: d.timezone_offset };
}
