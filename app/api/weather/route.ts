import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeather, getOneCallForecast } from '@/lib/openweather';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const latStr = params.get('lat');
  const lonStr = params.get('lon');
  const units = params.get('units') === 'metric' ? 'metric' : 'imperial';
  const type = params.get('type') ?? 'current';

  if (!latStr || !lonStr) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'Invalid lat/lon values' }, { status: 400 });
  }

  try {
    if (type === 'forecast') {
      const data = await getOneCallForecast(lat, lon, units);
      return NextResponse.json(data);
    } else {
      const data = await getCurrentWeather(lat, lon, units);
      return NextResponse.json(data);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Weather fetch failed';
    if (message === 'ONECALL_UNAVAILABLE') {
      return NextResponse.json({ error: 'ONECALL_UNAVAILABLE' }, { status: 403 });
    }
    if (message.includes('Invalid API key')) {
      return NextResponse.json({ error: 'Invalid API key. Check OPENWEATHER_API_KEY.' }, { status: 401 });
    }
    if (message.includes('rate limit')) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
