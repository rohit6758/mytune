import localforage from 'localforage';

localforage.config({
  name: 'MyTune',
  storeName: 'audio_cache'
});

export const getCachedAudioUrl = async (trackId: string, remoteUrl: string): Promise<string> => {
  try {
    const cachedBlob = await localforage.getItem<Blob>(`audio_${trackId}`);
    if (cachedBlob) {
      console.log('MyTune: Playing offline from cache ->', trackId);
      return URL.createObjectURL(cachedBlob);
    }
    
    console.log('MyTune: Downloading to offline cache ->', trackId);
    const res = await fetch(remoteUrl);
    if (!res.ok) throw new Error('Network response was not ok');
    const blob = await res.blob();
    
    await localforage.setItem(`audio_${trackId}`, blob);
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Offline cache error:', err);
    return remoteUrl;
  }
};
