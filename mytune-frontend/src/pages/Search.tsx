import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const GENRES = ['Pop', 'Hip Hop', 'Rock', 'Electronic', 'R&B', 'Alternative'];
const BRAND_GRAD = 'linear-gradient(135deg, #A855F7 0%, #8B16FF 50%, #5E00D4 100%)';

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [genreTracks, setGenreTracks] = useState<Record<string, any[]>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  // Fetch initial genres from iTunes API
  useEffect(() => {
    GENRES.forEach(async (genre) => {
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(genre)}&limit=15&media=music`);
        const data = await res.json();
        
        const mapped = (data?.results || []).map((t: any) => ({
            id: t.trackId,
            title: t.trackName,
            artist: t.artistName,
            bgImage: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '600x600bb') : '',
            previewUrl: t.previewUrl,
        })).filter((t: any) => t.previewUrl && t.bgImage);

        setGenreTracks(prev => ({ ...prev, [genre]: mapped }));
      } catch (e) {
        console.error(`Error fetching genre ${genre}`, e);
      }
    });
  }, []);

  // Handle Search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=25&media=music`);
        const data = await res.json();
        
        const mapped = (data?.results || []).map((t: any) => ({
            id: t.trackId,
            title: t.trackName,
            artist: t.artistName,
            bgImage: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '600x600bb') : '',
            previewUrl: t.previewUrl,
        })).filter((t: any) => t.previewUrl && t.bgImage);

        setSearchResults(mapped);
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 500); // debounce
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  const saveToLibrary = async (track: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent playing when clicking like
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from('library').insert({
        user_id: user.id,
        track_id: String(track.id),
        title: track.title,
        artist: track.artist,
        cover_url: track.bgImage,
        preview_url: track.previewUrl
      });
      // Optionally show a toast here
      console.log('Saved to library');
    } catch (err) {
      console.error('Failed to save track', err);
    }
  };

  const handlePlay = (track: any) => {
    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.previewUrl;
        audioRef.current.play().catch(e => console.error("Playback failed", e));
        setPlayingTrackId(track.id);
      }
    }
  };

  const renderTrackCard = (track: any) => {
    const isPlaying = playingTrackId === track.id;
    return (
      <div key={track.id} className="flex-shrink-0 w-32 group relative rounded-xl overflow-hidden cursor-pointer" onClick={() => handlePlay(track)}>
        <div className="relative w-32 h-32 mb-2 rounded-xl overflow-hidden shadow-lg">
          <img src={track.bgImage} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          
          {/* Play Overlay */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl" style={{ background: BRAND_GRAD }}>
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </div>
          </div>

          {/* Like Button Overlay */}
          <button 
             onClick={(e) => saveToLibrary(track, e)}
             className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
          </button>
        </div>
        <p className="text-sm font-bold text-white truncate">{track.title}</p>
        <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
      </div>
    );
  };

  return (
    <div className="inner-scroll h-full overflow-y-auto px-4 pt-4 pb-6 w-full max-w-3xl mx-auto flex flex-col gap-6">
      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />

      {/* Search Bar */}
      <div className="sticky top-0 pt-2 pb-2 bg-[#110D17] z-40">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            search
          </span>
          <input
            className="w-full bg-[#181818] border border-transparent rounded-full py-3.5 pl-12 pr-4 text-base text-white placeholder-white/35 transition-all duration-200 focus:border-[#D0FF00] focus:outline-none focus:ring-2 focus:ring-[#D0FF00]/25"
            placeholder="Artists, songs, or podcasts"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {query.trim() ? (
        /* Search Results View */
        <section>
          <h2 className="text-xl font-extrabold mb-4 text-white">Top Results</h2>
          {isSearching ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#D0FF00] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map(track => {
                const isPlaying = playingTrackId === track.id;
                return (
                  <div key={track.id} onClick={() => handlePlay(track)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img src={track.bgImage} className="w-full h-full object-cover" alt="" />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                         <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isPlaying ? 'pause' : 'play_arrow'}
                         </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-[#D0FF00] transition-colors">{track.title}</p>
                      <p className="text-xs text-white/50 truncate">{track.artist}</p>
                    </div>
                    <button 
                       onClick={(e) => saveToLibrary(track, e)}
                       className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#D0FF00]"
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/50 text-center py-10">No results found for "{query}"</p>
          )}
        </section>
      ) : (
        /* Default Browse View */
        <div className="flex flex-col gap-8 pb-4">
          {GENRES.map(genre => {
            const tracks = genreTracks[genre];
            if (!tracks) {
              // Loading skeleton
              return (
                <section key={genre}>
                  <h2 className="text-xl font-extrabold mb-4 text-white">{genre}</h2>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex-shrink-0 w-32">
                         <div className="w-32 h-32 bg-white/5 rounded-xl mb-2 animate-pulse" />
                         <div className="w-24 h-4 bg-white/5 rounded mt-1 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </section>
              );
            }
            
            if (tracks.length === 0) return null; // Hide if empty

            return (
              <section key={genre}>
                <h2 className="text-xl font-extrabold mb-4 text-white">{genre}</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {tracks.map(renderTrackCard)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
