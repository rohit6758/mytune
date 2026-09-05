import localforage from 'localforage';

localforage.config({
  name: 'MyTune',
  storeName: 'audio_cache'
});

export const getCachedAudioUrl = async (track: {id: string, title: string, artist: string, preview_url: string}): Promise<string> => {
  try {
    const cachedBlob = await localforage.getItem<Blob>(`audio_${track.id}`);
    if (cachedBlob) {
      console.log('MyTune: Playing offline from cache ->', track.id);
      return URL.createObjectURL(cachedBlob);
    }
    
    console.log('MyTune: Fetching full stream from Node backend ->', track.id);
    // Call the Vercel serverless function (relative path works natively on Vercel)
    const searchRes = await fetch(`/api/stream?q=${encodeURIComponent(track.title + ' ' + track.artist)}`);
    
    if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.url) {
            console.log('MyTune: Using direct YouTube stream URL ->', track.id);
            return data.url;
        }
    }

    console.warn('Fallback to iTunes preview URL');
    return track.preview_url;
  } catch (err) {
    console.error('Offline cache error:', err);
    return track.preview_url;
  }
};
