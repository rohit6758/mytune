import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePlayer, Track } from '../context/PlayerContext';

const CATEGORIES = [
  { name: 'Pop', color: 'from-orange-500 to-red-500', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop' },
  { name: 'Rock', color: 'from-amber-600 to-orange-700', img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop' },
  { name: 'Hip-Hop', color: 'from-orange-400 to-red-600', img: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=300&h=300&fit=crop' },
  { name: 'Synthwave', color: 'from-red-500 to-orange-600', img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop' },
  { name: 'Jazz', color: 'from-amber-700 to-orange-800', img: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop' },
  { name: 'Electronic', color: 'from-orange-500 to-red-700', img: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=300&h=300&fit=crop' },
  { name: 'Indie', color: 'from-red-600 to-orange-500', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop' },
  { name: 'Classical', color: 'from-orange-600 to-amber-700', img: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop' },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const { currentTrack, playQueue } = usePlayer();

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=30&media=music`);
        const data = await res.json();
        
        if (data?.results?.length > 0) {
          const results = data.results.map((t: any) => ({
            id: String(t.trackId),
            title: t.trackName,
            artist: t.artistName,
            cover_url: t.artworkUrl100?.replace('100x100bb', '600x600bb') || '',
            preview_url: t.previewUrl || '',
            duration: t.trackTimeMillis ? Math.floor(t.trackTimeMillis / 1000) : 0,
          })).filter((t: any) => t.preview_url && t.cover_url);
          
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (e) {
        console.error("Search failed", e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 600); // debounce
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const saveToLibrary = async (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      await supabase.from('library').insert({
        user_id: user.id, track_id: track.id, title: track.title, artist: track.artist, cover_url: track.cover_url
      });
      showToast('Saved to library');
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const handlePlay = (track: Track, list: Track[]) => {
    const startIndex = list.findIndex(t => t.id === track.id);
    playQueue(list, startIndex >= 0 ? startIndex : 0);
  };

  return (
    <div className="inner-scroll h-full overflow-y-auto px-4 pt-4 pb-6 w-full max-w-2xl mx-auto flex flex-col gap-6" style={{ paddingBottom: '120px' }}>
      
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-[#F5E642] text-black font-bold text-sm px-5 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Search Bar */}
      <div className="sticky top-0 pt-2 pb-2 bg-transparent z-40">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            search
          </span>
          <input
            className="w-full bg-[#110f14] border border-transparent rounded-full py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/35 transition-all duration-200 focus:border-[#F5E642] focus:outline-none focus:ring-2 focus:ring-[#F5E642]/25 shadow-lg"
            placeholder="Search MyTune..."
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-xl">
            public
          </span>
        </div>
      </div>

      {query.trim() ? (
        /* Search Results View */
        <section>
          {isSearching ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#F5E642] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="flex flex-col gap-2">
              {searchResults.map(track => {
                const isPlaying = currentTrack?.id === track.id;
                return (
                  <div key={track.id} onClick={() => handlePlay(track, searchResults)} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group ${isPlaying ? 'bg-[#F5E642]/10' : 'hover:bg-white/5'}`}>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                      <img src={track.cover_url} className="w-full h-full object-cover" alt="" />
                      <div className={`absolute inset-0 bg-transparent/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                         <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isPlaying ? 'pause' : 'play_arrow'}
                         </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isPlaying ? 'text-[#F5E642]' : 'text-white group-hover:text-[#F5E642] transition-colors'}`}>{track.title}</p>
                      <p className="text-xs text-white/50 truncate">{track.artist}</p>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => saveToLibrary(track, e)} className="p-2 hover:text-[#F5E642] text-white/50">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('mytune:add-to-playlist', { detail: track })); }} className="p-2 hover:text-[#F5E642] text-white/50">
                        <span className="material-symbols-outlined text-[20px]">playlist_add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/50 text-center py-10">No results found for "{query}"</p>
          )}
        </section>
      ) : (
        /* Original Browse View */
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-white text-2xl font-bold mb-4 tracking-wide">Browse All</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((category) => (
                <div
                  key={category.name}
                  onClick={() => setQuery(category.name)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group bg-gradient-to-br ${category.color} hover:scale-[1.02] transition-transform duration-300 shadow-md flex flex-col p-4`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                  <h3 className="relative z-20 text-xl font-bold font-display tracking-wide drop-shadow-md text-white">
                    {category.name}
                  </h3>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 rotate-[25deg] shadow-2xl z-0 transition-transform duration-300 group-hover:scale-110">
                     <img src={category.img} className="w-full h-full object-cover rounded-md" alt="" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
