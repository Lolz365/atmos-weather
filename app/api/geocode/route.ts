import { NextRequest, NextResponse } from 'next/server';
import { geocodeCity } from '@/lib/openweather';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }
  if (q.length > 100) {
    return NextResponse.json({ error: 'Query too long' }, { status: 400 });
  }
  try {
    const results = await geocodeCity(q);
    return NextResponse.json(results);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Geocoding failed';
    if (message.includes('Invalid API key')) {
      return NextResponse.json({ error: 'Invalid API key. Check OPENWEATHER_API_KEY.' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
