export interface YTTrack {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  cover_url: string;
  preview_url?: string; // We might fetch this lazily
  duration?: number;
}

const PIPED_API = 'https://pipedapi.kavin.rocks';

// Fallback instances in case kavin.rocks is down
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://api.piped.projectsegfau.lt',
];

let currentInstanceIndex = 0;

async function fetchWithFallback(endpoint: string) {
  for (let i = 0; i < PIPED_INSTANCES.length; i++) {
    const instance = PIPED_INSTANCES[(currentInstanceIndex + i) % PIPED_INSTANCES.length];
    try {
      const res = await fetch(`${instance}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // If successful, stick to this instance for future requests
      currentInstanceIndex = (currentInstanceIndex + i) % PIPED_INSTANCES.length;
      return data;
    } catch (e) {
      console.warn(`Failed fetching from ${instance}, trying next...`);
    }
  }
  throw new Error('All Piped API instances failed');
}

export async function searchYTSongs(query: string): Promise<YTTrack[]> {
  if (!query.trim()) return [];
  try {
    const data = await fetchWithFallback(`/search?q=${encodeURIComponent(query)}&filter=music_songs`);
    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.url.replace('/watch?v=', ''),
      title: item.title,
      artist: item.uploaderName || 'Unknown Artist',
      cover_url: item.thumbnail,
      duration: item.duration,
    }));
  } catch (error) {
    console.error('Error searching YouTube Music:', error);
    return [];
  }
}

export async function getAudioStreamUrl(videoId: string): Promise<string | null> {
  try {
    const data = await fetchWithFallback(`/streams/${videoId}`);
    if (!data.audioStreams || data.audioStreams.length === 0) return null;

    // Prefer m4a format for better compatibility in web audio, or highest bitrate webm
    const audioStream = data.audioStreams.find((s: any) => s.mimeType.includes('mp4') || s.mimeType.includes('m4a')) 
                     || data.audioStreams[0];

    return audioStream.url;
  } catch (error) {
    console.error(`Error fetching audio stream for ${videoId}:`, error);
    return null;
  }
}
