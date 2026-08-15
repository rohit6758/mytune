import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Track } from '../context/PlayerContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

export default function AddToPlaylistModal({ isOpen, onClose, track }: Props) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchPlaylists();
  }, [isOpen]);

  const fetchPlaylists = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setPlaylists(data);
    }
    setLoading(false);
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!track) return;
    try {
      await supabase.from('playlist_tracks').insert({
        playlist_id: playlistId,
        track_id: track.id,
        title: track.title,
        artist: track.artist,
        cover_url: track.cover_url,
        preview_url: track.preview_url
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#200F07]/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1625] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <h2 className="text-xl font-bold text-white mb-4">Add to Playlist</h2>
        
        <div className="flex items-center gap-3 mb-6 p-3 bg-[#110D17] rounded-xl border border-white/5">
          <img src={track.cover_url} className="w-12 h-12 rounded shadow" alt="cover" />
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{track.title}</p>
            <p className="text-white/50 text-xs truncate">{track.artist}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#C5E384] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : playlists.length === 0 ? (
          <p className="text-center text-white/50 py-4 text-sm">You don't have any playlists. Go to Library to create one.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar">
            {playlists.map(pl => (
              <button 
                key={pl.id}
                onClick={() => addToPlaylist(pl.id)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-colors border border-transparent hover:border-white/10"
              >
                <div className="w-10 h-10 bg-[#252031] rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/30 text-xl">queue_music</span>
                </div>
                <span className="text-white font-semibold text-sm flex-1 truncate">{pl.name}</span>
                <span className="material-symbols-outlined text-[#C5E384] opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
