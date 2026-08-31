/**
 * lyricsService.ts
 * Fetches lyrics from the free lyrics.ovh API.
 * Results are cached in sessionStorage so we never re-fetch the same track.
 */

const BASE = 'https://api.lyrics.ovh/v1';

export async function fetchLyrics(artist: string, title: string): Promise<string | null> {
  // Clean up artist/title (remove features, remix notes, etc.)
  const cleanArtist = artist.split(/,|feat\.|ft\.|&/i)[0].trim();
  const cleanTitle  = title
    .replace(/\s*\(.*?\)\s*/g, '')  // remove (remix), (feat. x), etc.
    .replace(/\s*\[.*?\]\s*/g, '')
    .trim();

  const cacheKey = `lyrics:${cleanArtist}:${cleanTitle}`.toLowerCase();
  const cached = sessionStorage.getItem(cacheKey);
  if (cached !== null) {
    return cached === 'NONE' ? null : cached;
  }

  try {
    const url = `${BASE}/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      sessionStorage.setItem(cacheKey, 'NONE');
      return null;
    }
    const json = await res.json();
    if (json.lyrics && json.lyrics.trim().length > 0) {
      sessionStorage.setItem(cacheKey, json.lyrics.trim());
      return json.lyrics.trim();
    }
    sessionStorage.setItem(cacheKey, 'NONE');
    return null;
  } catch {
    // Network error or timeout — don't cache so we retry next time
    return null;
  }
}
