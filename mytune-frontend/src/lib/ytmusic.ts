export interface YTTrack {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  cover_url: string;
  preview_url?: string;
  duration?: number;
}

export async function searchYTSongs(query: string): Promise<YTTrack[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.warn('YT Search API returned error status:', res.status);
      return [];
    }
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error('Error searching YouTube Music via internal API:', error);
    return [];
  }
}

export async function getAudioStreamUrl(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/stream?id=${encodeURIComponent(videoId)}`);
    if (!res.ok) {
      console.warn('YT Stream API returned error status:', res.status);
      return null;
    }
    const data = await res.json();
    return data?.url || null;
  } catch (error) {
    console.error(`Error fetching audio stream for ${videoId}:`, error);
    return null;
  }
}
