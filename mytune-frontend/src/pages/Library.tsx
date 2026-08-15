import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const BRAND_GRAD = 'linear-gradient(135deg, #A855F7 0%, #8B16FF 50%, #5E00D4 100%)';

export default function Library() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('library')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTracks(data);
      } else {
        console.error(error);
      }
    }
    setLoading(false);
  };

  const handlePlay = (track: any) => {
    if (playingTrackId === track.track_id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current && track.preview_url) {
        audioRef.current.src = track.preview_url;
        audioRef.current.play().catch(e => console.error("Playback failed", e));
        setPlayingTrackId(track.track_id);
      }
    }
  };

  const removeTrack = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from('library').delete().eq('user_id', user.id).eq('track_id', trackId);
      setTracks(prev => prev.filter(t => t.track_id !== trackId));
      if (playingTrackId === trackId) {
        audioRef.current?.pause();
        setPlayingTrackId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-[#D0FF00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="inner-scroll h-full overflow-y-auto px-4 pt-4 pb-6 w-full max-w-3xl mx-auto flex flex-col gap-6">
      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />
      
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-[#110D17] pt-2 pb-4 z-40">
        <h1 className="text-3xl font-black text-white tracking-tight">Your Library</h1>
        <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
        </button>
      </div>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <span className="material-symbols-outlined text-[64px] mb-4" style={{ fontVariationSettings: "'FILL' 0" }}>library_music</span>
          <p className="text-lg font-bold">Your library is empty</p>
          <p className="text-sm mt-1 text-center max-w-[250px]">Go to Discover or Search and like some songs to add them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tracks.map(track => {
            const isPlaying = playingTrackId === track.track_id;
            return (
              <div key={track.id} onClick={() => handlePlay(track)} className="flex items-center gap-3 p-3 bg-[#1A1625] rounded-xl hover:bg-white/5 cursor-pointer transition-colors group border border-transparent hover:border-white/10">
                <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 shadow-lg">
                  <img src={track.cover_url} className="w-full h-full object-cover" alt={track.title} />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-white truncate group-hover:text-[#D0FF00] transition-colors">{track.title}</p>
                  <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
                </div>
                <button 
                  onClick={(e) => removeTrack(track.track_id, e)}
                  className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#D0FF00]"
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
