import type { Units } from './types';

export function formatTemp(temp: number, units: Units): string {
  const rounded = Math.round(temp);
  return `${rounded}°${units === 'imperial' ? 'F' : 'C'}`;
}

export function formatTempShort(temp: number): string {
  return `${Math.round(temp)}°`;
}

export function formatWindSpeed(speed: number, units: Units): string {
  return units === 'imperial' ? `${Math.round(speed)} mph` : `${Math.round(speed)} m/s`;
}

export function formatVisibility(meters: number, units: Units): string {
  if (units === 'imperial') {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  }
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

export function formatPressure(hPa: number): string {
  return `${hPa} hPa`;
}

export function formatHumidity(pct: number): string {
  return `${pct}%`;
}

export function windDirection(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}

/**
 * Convert a Unix timestamp + timezone offset (seconds) to a local Date-like object
 * without relying on the browser's locale timezone.
 */
export function toLocalDate(unixSeconds: number, tzOffsetSeconds: number): Date {
  // shift UTC time by the location's offset
  return new Date((unixSeconds + tzOffsetSeconds) * 1000);
}

export function formatLocalTime(unixSeconds: number, tzOffsetSeconds: number): string {
  const d = toLocalDate(unixSeconds, tzOffsetSeconds);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatLocalDate(unixSeconds: number, tzOffsetSeconds: number): string {
  const d = toLocalDate(unixSeconds, tzOffsetSeconds);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function formatHourLabel(unixSeconds: number, tzOffsetSeconds: number): string {
  const d = toLocalDate(unixSeconds, tzOffsetSeconds);
  const h = d.getUTCHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}${ampm}`;
}

export function formatDayLabel(unixSeconds: number, tzOffsetSeconds: number): string {
  const d = toLocalDate(unixSeconds, tzOffsetSeconds);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getUTCDay()];
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getContextualLine(conditionMain: string, icon: string): string {
  const isNight = icon.endsWith('n');
  const timeWord = isNight ? 'tonight' : 'today';
  const map: Record<string, string> = {
    Clear: isNight ? 'Clear skies tonight' : 'Clear and sunny today',
    Clouds: `Cloudy ${timeWord}`,
    Rain: `Rain expected ${timeWord}`,
    Drizzle: `Light drizzle ${timeWord}`,
    Thunderstorm: `Thunderstorms possible ${timeWord}`,
    Snow: `Snow falling ${timeWord}`,
    Mist: `Misty conditions ${timeWord}`,
    Fog: `Foggy ${timeWord}`,
    Haze: `Hazy skies ${timeWord}`,
    Smoke: `Smoky air ${timeWord}`,
    Dust: `Dusty conditions ${timeWord}`,
    Sand: `Blowing sand ${timeWord}`,
    Ash: `Volcanic ash in the air`,
    Squall: `Squalls possible ${timeWord}`,
    Tornado: `Tornado warning in effect`,
  };
  return map[conditionMain] ?? `${conditionMain} ${timeWord}`;
}

export function getWeatherGradient(conditionId: number, icon: string): string {
  const isNight = icon.endsWith('n');
  if (isNight) return 'from-slate-900 via-slate-800 to-indigo-950';
  if (conditionId >= 200 && conditionId < 300) return 'from-slate-700 via-slate-600 to-zinc-700'; // thunderstorm
  if (conditionId >= 300 && conditionId < 600) return 'from-slate-600 via-slate-500 to-blue-700'; // rain/drizzle
  if (conditionId >= 600 && conditionId < 700) return 'from-slate-300 via-blue-200 to-indigo-300'; // snow
  if (conditionId >= 700 && conditionId < 800) return 'from-amber-200 via-stone-300 to-slate-400'; // atmosphere
  if (conditionId === 800) return 'from-sky-400 via-blue-500 to-indigo-600'; // clear
  if (conditionId === 801 || conditionId === 802) return 'from-sky-300 via-blue-400 to-indigo-500'; // few clouds
  return 'from-slate-400 via-slate-500 to-blue-600'; // overcast
}
