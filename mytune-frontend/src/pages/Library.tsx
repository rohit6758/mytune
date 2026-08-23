import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { usePlayer, Track } from '../context/PlayerContext';

// ─── Preset gradient covers ────────────────────────────────────────────────
const GRADIENT_PRESETS = [
  { id: 'og',   label: 'MyTune',   css: 'linear-gradient(135deg, #D2EA7C 0%, #78A723 100%)' },
  { id: 'void', label: 'Void',     css: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243e 100%)' },
  { id: 'sun',  label: 'Sunrise',  css: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)' },
  { id: 'ocean',label: 'Ocean',    css: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { id: 'pine', label: 'Forest',   css: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)' },
  { id: 'rose', label: 'Rose',     css: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' },
  { id: 'mid',  label: 'Midnight', css: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 'neon', label: 'Neon',     css: 'linear-gradient(135deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)' },
  { id: 'gold', label: 'Gold',     css: 'linear-gradient(135deg, #c6a700 0%, #ffe259 100%)' },
  { id: 'deep', label: 'Deep',     css: 'linear-gradient(135deg, #360033 0%, #0b8793 100%)' },
];

// ─── Emoji shortcuts ────────────────────────────────────────────────────────
const EMOJI_COVERS = ['🎵', '🔥', '💜', '🌙', '🎧', '⚡', '🌊', '🌿', '🎤', '🏋️'];

// ─── Playlist Cover component (renders consistently everywhere) ─────────────
function PlaylistCover({
  cover,
  size = 'md',
  className = '',
}: {
  cover?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const s = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-full aspect-square' : 'w-36 h-36';
  const textSize = size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-7xl' : 'text-4xl';

  if (!cover) {
    return (
      <div className={`${s} ${className} rounded-xl flex items-center justify-center bg-[#25212c] border border-white/5`}>
        <span className="material-symbols-outlined text-white/20 text-4xl">queue_music</span>
      </div>
    );
  }

  // Is it an emoji?
  if (cover.length <= 4 && /\p{Emoji}/u.test(cover)) {
    return (
      <div className={`${s} ${className} rounded-xl flex items-center justify-center bg-[#1e1b24]`}>
        <span className={textSize}>{cover}</span>
      </div>
    );
  }

  // Is it a data URL / blob URL / https image?
  if (cover.startsWith('data:') || cover.startsWith('blob:') || cover.startsWith('http')) {
    return (
      <img src={cover} alt="" className={`${s} ${className} rounded-xl object-cover`} />
    );
  }

  // Otherwise it's a gradient preset ID
  const preset = GRADIENT_PRESETS.find(p => p.id === cover);
  return (
    <div
      className={`${s} ${className} rounded-xl`}
      style={{ background: preset?.css || GRADIENT_PRESETS[0].css }}
    />
  );
}

// ─── Playlist Cover Picker modal ─────────────────────────────────────────────
function CoverPickerModal({
  current,
  onSave,
  onClose,
  playlistId,
}: {
  current?: string | null;
  onSave: (cover: string) => void;
  onClose: () => void;
  playlistId?: string;
}) {
  const [tab, setTab] = useState<'gradient' | 'emoji' | 'photo'>('gradient');
  const [selected, setSelected] = useState<string>(current || GRADIENT_PRESETS[0].id);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `playlist-covers/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('covers').upload(fileName, file, { contentType: file.type, upsert: true });
      if (error) {
        // Fallback: use a local blob URL if storage bucket doesn't exist
        console.warn('Storage upload failed, using local blob URL:', error.message);
        const blobUrl = URL.createObjectURL(file);
        setSelected(blobUrl);
        setTab('photo');
        setUploading(false);
        return;
      }
      const { data } = supabase.storage.from('covers').getPublicUrl(fileName);
      setSelected(data.publicUrl);
      setTab('photo');
    } catch (err: any) {
      console.error(err);
      // Fallback to blob URL
      const blobUrl = URL.createObjectURL(file);
      setSelected(blobUrl);
    } finally {
      setUploading(false);
    }
  };

  const TABS = [
    { id: 'gradient', label: 'Color', icon: 'palette' },
    { id: 'emoji',    label: 'Emoji', icon: 'mood' },
    { id: 'photo',    label: 'Photo', icon: 'image' },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#111] border-t border-white/10 rounded-t-3xl p-6 flex flex-col gap-5 z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        <h3 className="text-lg font-black text-white">Playlist Cover</h3>

        {/* Live Preview */}
        <div className="flex items-center gap-4">
          <PlaylistCover cover={selected} size="md" className="shadow-xl flex-shrink-0" />
          <div className="text-white/50 text-sm leading-relaxed">
            Pick a <strong className="text-white">color</strong>, an <strong className="text-white">emoji</strong>, or upload a <strong className="text-white">photo</strong> as your playlist cover.
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-white/5 rounded-full p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-bold transition-all ${
                tab === t.id ? 'bg-[#D2EA7C] text-black shadow' : 'text-white/50 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Gradient grid */}
        {tab === 'gradient' && (
          <div className="grid grid-cols-5 gap-3">
            {GRADIENT_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelected(preset.id)}
                className={`w-full aspect-square rounded-xl transition-all active:scale-95 ${
                  selected === preset.id ? 'ring-2 ring-[#D2EA7C] ring-offset-2 ring-offset-[#111] scale-95' : ''
                }`}
                style={{ background: preset.css }}
                title={preset.label}
              />
            ))}
          </div>
        )}

        {/* Emoji grid */}
        {tab === 'emoji' && (
          <div className="grid grid-cols-5 gap-3">
            {EMOJI_COVERS.map(em => (
              <button
                key={em}
                onClick={() => setSelected(em)}
                className={`w-full aspect-square text-3xl rounded-xl bg-[#1e1b24] flex items-center justify-center transition-all active:scale-95 ${
                  selected === em ? 'ring-2 ring-[#D2EA7C] ring-offset-2 ring-offset-[#111] scale-95' : 'hover:bg-white/10'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        )}

        {/* Photo upload */}
        {tab === 'photo' && (
          <div className="flex flex-col items-center gap-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-white/20 text-white/60 font-semibold hover:border-[#D2EA7C]/60 hover:text-[#D2EA7C] transition-all flex flex-col items-center gap-2 active:scale-95"
            >
              {uploading ? (
                <div className="w-7 h-7 border-2 border-[#D2EA7C] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>add_photo_alternate</span>
              )}
              <span>{uploading ? 'Uploading...' : 'Choose from Camera Roll'}</span>
            </button>
            {selected?.startsWith('http') || selected?.startsWith('blob') ? (
              <p className="text-xs text-white/40 text-center">Photo uploaded ✓ — tap Save to apply.</p>
            ) : null}
          </div>
        )}

        {/* Save / Cancel */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-full bg-white/10 text-white font-bold text-sm">
            Cancel
          </button>
          <button
            onClick={() => { onSave(selected); onClose(); }}
            className="flex-1 py-3 rounded-full font-bold text-sm text-black"
            style={{ background: 'linear-gradient(135deg, #D2EA7C 0%, #78A723 100%)' }}
          >
            Save Cover
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Library Page ────────────────────────────────────────────────────────
export default function Library() {
  const [likedTracks, setLikedTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistCover, setNewPlaylistCover] = useState<string>(GRADIENT_PRESETS[0].id);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showEditCover, setShowEditCover] = useState(false);

  const { currentTrack, playTrack, playQueue } = usePlayer();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Load from cache first for instant display
    const cachedLiked = localStorage.getItem('mytune_liked_tracks');
    const cachedPlaylists = localStorage.getItem('mytune_playlists');
    if (cachedLiked) setLikedTracks(JSON.parse(cachedLiked));
    if (cachedPlaylists) setPlaylists(JSON.parse(cachedPlaylists));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: likedData } = await supabase.from('library').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (likedData) {
          setLikedTracks(likedData);
          localStorage.setItem('mytune_liked_tracks', JSON.stringify(likedData));
        }
        const { data: playlistsData } = await supabase.from('playlists').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (playlistsData) {
          setPlaylists(playlistsData);
          localStorage.setItem('mytune_playlists', JSON.stringify(playlistsData));
        }
      }
    } catch (err) {
      console.log('Offline: using cached library data');
    }
    setLoading(false);
  };

  const fetchPlaylistTracks = async (id: string) => {
    setLoadingTracks(true);
    
    const cacheKey = `mytune_playlist_${id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) setPlaylistTracks(JSON.parse(cached));
    
    try {
      const { data } = await supabase.from('playlist_tracks').select('*').eq('playlist_id', id).order('created_at', { ascending: false });
      if (data) {
        setPlaylistTracks(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (err) {
      console.log('Offline: using cached playlist tracks');
    }
    setLoadingTracks(false);
  };

  const openPlaylist = (pl: any) => {
    setSelectedPlaylist(pl);
    fetchPlaylistTracks(pl.id);
  };

  const handlePlayQueue = (tracks: any[]) => {
    if (!tracks.length) return;
    const q: Track[] = tracks.map(t => ({ id: t.track_id, title: t.title, artist: t.artist, cover_url: t.cover_url, preview_url: t.preview_url }));
    playQueue(q, 0);
  };

  const handlePlayTrack = (startIndex: number) => {
    if (!playlistTracks.length) return;
    const q: Track[] = playlistTracks.map(t => ({ id: t.track_id, title: t.title, artist: t.artist, cover_url: t.cover_url, preview_url: t.preview_url }));
    playQueue(q, startIndex);
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({ user_id: user.id, name: newPlaylistName.trim(), cover: newPlaylistCover })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setPlaylists([data, ...playlists]);
        setIsCreating(false);
        setNewPlaylistName('');
        setNewPlaylistCover(GRADIENT_PRESETS[0].id);
      }
    } catch (err: any) {
      alert('Error creating playlist: ' + err.message);
    }
  };

  const updatePlaylistCover = async (cover: string) => {
    if (!selectedPlaylist || selectedPlaylist.id === 'liked') return;
    try {
      await supabase.from('playlists').update({ cover }).eq('id', selectedPlaylist.id);
      const updated = { ...selectedPlaylist, cover };
      setSelectedPlaylist(updated);
      setPlaylists(prev => prev.map(p => p.id === selectedPlaylist.id ? updated : p));
    } catch (err) {
      console.error('Failed to update cover', err);
    }
  };

  const deletePlaylist = async () => {
    if (!selectedPlaylist || selectedPlaylist.id === 'liked') return;
    if (!window.confirm(`Delete "${selectedPlaylist.name}"?`)) return;
    await supabase.from('playlists').delete().eq('id', selectedPlaylist.id);
    setPlaylists(prev => prev.filter(p => p.id !== selectedPlaylist.id));
    setSelectedPlaylist(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D2EA7C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Playlist Detail View ───────────────────────────────────────────────────
  if (selectedPlaylist) {
    return (
      <div className="inner-scroll h-full overflow-y-auto w-full max-w-2xl mx-auto flex flex-col" style={{ paddingBottom: '120px' }}>
        {/* Hero header with cover */}
        <div
          className="relative w-full flex flex-col items-center justify-end pt-8 pb-8 px-4 gap-4"
          style={{
            background: (() => {
              const c = selectedPlaylist.cover;
              if (!c) return 'linear-gradient(135deg, #D2EA7C 0%, #78A723 100%)';
              if (c.length <= 4) return '#1e1b24';
              if (c.startsWith('http') || c.startsWith('blob') || c.startsWith('data')) return 'transparent';
              const p = GRADIENT_PRESETS.find(x => x.id === c);
              return p?.css || GRADIENT_PRESETS[0].css;
            })(),
            minHeight: '220px',
          }}
        >
          {/* If it's a photo, show as full-bleed behind */}
          {selectedPlaylist.cover?.startsWith?.('http') || selectedPlaylist.cover?.startsWith?.('blob') ? (
            <img src={selectedPlaylist.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Emoji big in center */}
          {selectedPlaylist.cover && selectedPlaylist.cover.length <= 4 ? (
            <span className="text-7xl relative z-10 mb-2">{selectedPlaylist.cover}</span>
          ) : null}

          <div className="relative z-10 w-full flex items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight">{selectedPlaylist.name}</h1>
              <p className="text-white/60 text-sm mt-1">{playlistTracks.length} tracks</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Edit cover button */}
              {selectedPlaylist.id !== 'liked' && (
                <button
                  onClick={() => setShowEditCover(true)}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center active:scale-90 transition-transform"
                  title="Change Cover"
                >
                  <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>edit</span>
                </button>
              )}
              {/* Delete */}
              {selectedPlaylist.id !== 'liked' && (
                <button onClick={deletePlaylist} className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center active:scale-90 transition-transform" title="Delete">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              )}
              {/* Play all */}
              {playlistTracks.length > 0 && (
                <button
                  onClick={() => handlePlayQueue(playlistTracks)}
                  className="w-11 h-11 rounded-full text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #D2EA7C 0%, #78A723 100%)' }}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="px-4 pt-4">
          <button onClick={() => setSelectedPlaylist(null)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-sm font-semibold">Back to Library</span>
          </button>
        </div>

        {/* Track list */}
        <div className="px-4 flex flex-col gap-1">
          {loadingTracks ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-[#D2EA7C] border-t-transparent rounded-full animate-spin" /></div>
          ) : playlistTracks.length === 0 ? (
            <div className="bg-[#1e1b24] border border-white/5 rounded-2xl p-6 text-center text-white/40 mt-4">
              No tracks yet — add songs from the Discover feed!
            </div>
          ) : (
            playlistTracks.map((track, i) => {
              const isActive = currentTrack?.id === track.track_id;
              return (
                <div
                  key={track.id}
                  onClick={() => handlePlayTrack(i)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors group ${isActive ? 'bg-[#D2EA7C]/10' : 'hover:bg-white/5'}`}
                >
                  <span className="text-white/30 text-xs w-5 text-center font-mono flex-shrink-0">{i + 1}</span>
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={track.cover_url} className="w-full h-full object-cover" alt="" />
                    {isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#D2EA7C] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-[#D2EA7C]' : 'text-white'}`}>{track.title}</p>
                    <p className="text-xs text-white/50 truncate">{track.artist}</p>
                  </div>
                  <button
                    onClick={async e => {
                      e.stopPropagation();
                      if (selectedPlaylist.id === 'liked') {
                        await supabase.from('library').delete().eq('id', track.id);
                        setLikedTracks(prev => prev.filter(t => t.id !== track.id));
                      } else {
                        await supabase.from('playlist_tracks').delete().eq('id', track.id);
                      }
                      setPlaylistTracks(prev => prev.filter(t => t.id !== track.id));
                    }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Edit cover picker */}
        {showEditCover && (
          <CoverPickerModal
            current={selectedPlaylist.cover}
            onSave={updatePlaylistCover}
            onClose={() => setShowEditCover(false)}
            playlistId={selectedPlaylist.id}
          />
        )}
      </div>
    );
  }

  // ── Library List View ──────────────────────────────────────────────────────
  return (
    <div className="inner-scroll h-full overflow-y-auto px-4 pt-6 w-full max-w-2xl mx-auto flex flex-col gap-6" style={{ paddingBottom: '120px' }}>
      <h1 className="text-3xl font-black text-white">Your Library</h1>

      {/* Playlists */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Playlists</h2>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1 text-sm text-[#D2EA7C] font-bold bg-[#D2EA7C]/10 px-3 py-1.5 rounded-full hover:bg-[#D2EA7C]/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New
          </button>
        </div>

        {/* Create playlist form */}
        {isCreating && (
          <div className="bg-[#1e1b24] border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {/* Cover preview — tap to change */}
              <button
                onClick={() => setShowCoverPicker(true)}
                className="relative flex-shrink-0 group"
                title="Choose cover"
              >
                <PlaylistCover cover={newPlaylistCover} size="sm" />
                <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white text-base">edit</span>
                </div>
              </button>
              <input
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name..."
                className="flex-1 bg-transparent text-white outline-none placeholder-white/30 text-base font-semibold py-1 border-b border-white/10 focus:border-[#D2EA7C] transition-colors"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
              />
            </div>
            <p className="text-xs text-white/40 -mt-2 ml-15">Tap the icon above to pick a cover.</p>
            <div className="flex gap-2">
              <button onClick={() => { setIsCreating(false); setNewPlaylistName(''); }} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm">Cancel</button>
              <button
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim()}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #D2EA7C 0%, #78A723 100%)' }}
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Horizontal playlist grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Liked Songs */}
          <div
            onClick={() => { setSelectedPlaylist({ id: 'liked', name: 'Liked Songs', cover: null }); setPlaylistTracks(likedTracks); }}
            className="cursor-pointer group"
          >
            <div className="w-full aspect-square rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-105 transition-transform border border-[#D2EA7C]/20 group-active:scale-95" style={{ background: 'linear-gradient(135deg, #D2EA7C 0%, #78A723 100%)' }}>
              <span className="material-symbols-outlined text-5xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
            <p className="text-sm font-bold text-white truncate">Liked Songs</p>
            <p className="text-xs text-[#D2EA7C]">{likedTracks.length} songs</p>
          </div>

          {/* User playlists */}
          {playlists.map(pl => (
            <div key={pl.id} onClick={() => openPlaylist(pl)} className="cursor-pointer group">
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 shadow-lg group-hover:scale-105 transition-transform group-active:scale-95">
                <PlaylistCover cover={pl.cover} size="lg" />
              </div>
              <p className="text-sm font-bold text-white truncate">{pl.name}</p>
              <p className="text-xs text-white/50">Playlist</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cover picker for new playlist */}
      {showCoverPicker && (
        <CoverPickerModal
          current={newPlaylistCover}
          onSave={c => setNewPlaylistCover(c)}
          onClose={() => setShowCoverPicker(false)}
        />
      )}
    </div>
  );
}
