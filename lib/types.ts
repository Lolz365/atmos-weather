export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  displayName: string;
}

export interface CurrentWeather {
  locationName: string;
  lat: number;
  lon: number;
  dt: number;
  timezoneOffset: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  visibility: number;
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  uvIndex?: number;
  sunrise: number;
  sunset: number;
  conditionId: number;
  conditionMain: string;
  conditionDescription: string;
  conditionIcon: string;
  clouds: number;
  rain1h?: number;
  snow1h?: number;
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  conditionId: number;
  conditionMain: string;
  conditionDescription: string;
  conditionIcon: string;
  pop: number;
  rain1h?: number;
  snow1h?: number;
  uvi?: number;
}

export interface DailyForecast {
  dt: number;
  sunrise: number;
  sunset: number;
  tempDay: number;
  tempNight: number;
  tempMin: number;
  tempMax: number;
  tempMorn: number;
  tempEve: number;
  feelsLikeDay: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  conditionId: number;
  conditionMain: string;
  conditionDescription: string;
  conditionIcon: string;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
  clouds: number;
}

export interface ForecastData {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timezoneOffset: number;
}

export type Units = 'imperial' | 'metric';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface WeatherState {
  current: CurrentWeather | null;
  forecast: ForecastData | null;
  location: GeoLocation | null;
  units: Units;
  loading: boolean;
  forecastLoading: boolean;
  error: string | null;
  forecastError: string | null;
  forecastUnavailable: boolean;
}

// Raw OpenWeather API types
export interface OWGeoResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  local_names?: Record<string, string>;
}

export interface OWCurrentWeather {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  snow?: { '1h'?: number; '3h'?: number };
  dt: number;
  sys: { sunrise: number; sunset: number; country: string };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface OWOneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{ id: number; main: string; description: string; icon: string }>;
    rain?: { '1h': number };
    snow?: { '1h': number };
  };
  hourly: Array<{
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{ id: number; main: string; description: string; icon: string }>;
    pop: number;
    rain?: { '1h': number };
    snow?: { '1h': number };
  }>;
  daily: Array<{
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    temp: {
      day: number;
      min: number;
      max: number;
      night: number;
      eve: number;
      morn: number;
    };
    feels_like: { day: number; night: number; eve: number; morn: number };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{ id: number; main: string; description: string; icon: string }>;
    clouds: number;
    pop: number;
    rain?: number;
    snow?: number;
    uvi: number;
  }>;
  alerts?: Array<{
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
  }>;
}
