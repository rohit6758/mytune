import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePlayer, Track } from '../context/PlayerContext';

const BRAND_GRAD = 'linear-gradient(135deg, #FFF9EB 0%, #FFF9EB 50%, #FFF9EB 100%)';

export default function Library() {
  const [likedTracks, setLikedTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Playlist State
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const { currentTrack, playTrack, playQueue } = usePlayer();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Fetch Liked Tracks
      const { data: likedData } = await supabase
        .from('library')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (likedData) setLikedTracks(likedData);

      // Fetch Playlists
      const { data: playlistsData } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (playlistsData) setPlaylists(playlistsData);
    }
    setLoading(false);
  };

  const handlePlayLiked = () => {
    if (likedTracks.length === 0) return;
    const queue: Track[] = likedTracks.map(t => ({
      id: t.track_id,
      title: t.title,
      artist: t.artist,
      cover_url: t.cover_url,
      preview_url: t.preview_url
    }));
    playQueue(queue, 0);
  };

  const handlePlayTrack = (track: any) => {
    playTrack({
      id: track.track_id,
      title: track.title,
      artist: track.artist,
      cover_url: track.cover_url,
      preview_url: track.preview_url
    });
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({ user_id: user.id, name: newPlaylistName.trim() })
        .select()
        .single();
        
      if (error) throw error;
      if (data) {
        setPlaylists([data, ...playlists]);
        setIsCreating(false);
        setNewPlaylistName('');
      }
    } catch (err) {
      console.error('Failed to create playlist', err);
    }
  };

  const removeTrack = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from('library').delete().eq('user_id', user.id).eq('track_id', trackId);
      setLikedTracks(prev => prev.filter(t => t.track_id !== trackId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-[#C5E384] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className="inner-scroll h-full overflow-y-auto px-4 pt-8 w-full max-w-4xl mx-auto flex flex-col gap-8"
      style={{ paddingBottom: '100px' }} // Spacing for global player
    >
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-white tracking-tight">Your Library</h1>
      </div>

      {/* Playlists Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Playlists</h2>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1 text-sm text-[#C5E384] font-bold bg-[#C5E384]/10 px-3 py-1.5 rounded-full hover:bg-[#C5E384]/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New
          </button>
        </div>

        {isCreating && (
          <div className="flex gap-2 mb-4 bg-[#1e1b24] p-3 rounded-xl border border-white/10">
            <input 
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder="e.g. Gym Songs"
              className="flex-1 bg-transparent text-white outline-none placeholder-white/30 px-2"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && createPlaylist()}
            />
            <button onClick={createPlaylist} className="bg-[#FFF9EB] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#7200e6]">Create</button>
          </div>
        )}

        {playlists.length === 0 ? (
          <div className="bg-[#1e1b24] border border-white/5 rounded-2xl p-6 text-center text-white/50">
            You don't have any playlists yet.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {playlists.map(pl => (
              <div key={pl.id} className="flex-shrink-0 w-36 cursor-pointer group">
                <div className="w-36 h-36 bg-[#25212c] rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-white/20">queue_music</span>
                </div>
                <p className="text-sm font-bold text-white truncate">{pl.name}</p>
                <p className="text-xs text-white/50">Playlist</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Liked Songs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Liked Songs</h2>
          {likedTracks.length > 0 && (
            <button 
              onClick={handlePlayLiked}
              className="w-10 h-10 rounded-full bg-[#C5E384] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_4px_14px_0_rgba(208,255,0,0.2)]"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </button>
          )}
        </div>

        {likedTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <span className="material-symbols-outlined text-[64px] mb-4" style={{ fontVariationSettings: "'FILL' 0" }}>favorite_border</span>
            <p className="text-lg font-bold">No liked songs</p>
            <p className="text-sm mt-1 text-center max-w-[250px]">Go to Discover and like some songs to add them here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {likedTracks.map((track, index) => {
              const isPlaying = currentTrack?.id === track.track_id;
              return (
                <div 
                  key={track.id} 
                  onClick={() => handlePlayTrack(track)} 
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group ${isPlaying ? 'bg-[#C5E384]/10' : 'hover:bg-white/5'}`}
                >
                  <span className="text-white/30 text-xs w-4 text-center font-mono">{index + 1}</span>
                  
                  <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-md">
                    <img src={track.cover_url} className="w-full h-full object-cover" alt={track.title} />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-transparent/40 flex items-center justify-center">
                        <div className="w-3 h-3 flex justify-between items-end">
                          <div className="w-[3px] bg-[#C5E384] h-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-[3px] bg-[#C5E384] h-2/3 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-[3px] bg-[#C5E384] h-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-bold truncate ${isPlaying ? 'text-[#C5E384]' : 'text-white'}`}>{track.title}</p>
                    <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => removeTrack(track.track_id, e)}
                    className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#C5E384]"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
