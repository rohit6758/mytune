import { useState, useEffect, useRef } from 'react';

const GENRES = [
  { id: 132, name: 'Pop' },
  { id: 116, name: 'Hip Hop' },
  { id: 152, name: 'Rock' },
  { id: 106, name: 'Electro' },
  { id: 165, name: 'R&B' },
  { id: 85,  name: 'Alternative' }
];

const BRAND_GRAD = 'linear-gradient(135deg, #FF7000 0%, #FF3020 55%, #FF0000 100%)';

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [genreTracks, setGenreTracks] = useState<Record<number, any[]>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  // Fetch initial genres
  useEffect(() => {
    GENRES.forEach(async (genre) => {
      try {
        // Deezer chart by genre endpoint
        const deezerUrl = `https://api.deezer.com/chart/${genre.id}/tracks?limit=10`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(deezerUrl)}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();
        
        let tracks = data?.data || [];
        // If chart is empty for some reason, fallback to search
        if (tracks.length === 0) {
           const fallbackUrl = `https://api.deezer.com/search?q=${genre.name}&limit=10`;
           const fbProxyUrl = `https://corsproxy.io/?${encodeURIComponent(fallbackUrl)}`;
           const fbRes = await fetch(fbProxyUrl);
           const fbData = await fbRes.json();
           tracks = fbData?.data || [];
        }

        setGenreTracks(prev => ({ ...prev, [genre.id]: tracks.filter((t: any) => t.preview) }));
      } catch (e) {
        console.error(`Error fetching genre ${genre.name}`, e);
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
        const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(deezerUrl)}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();
        setSearchResults((data?.data || []).filter((t: any) => t.preview));
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 500); // debounce
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handlePlay = (track: any) => {
    if (playingTrackId === track.id) {
      // Pause
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      // Play new
      if (audioRef.current) {
        audioRef.current.src = track.preview;
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
          <img src={track.album.cover_medium} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl" style={{ background: BRAND_GRAD }}>
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm font-bold text-white truncate">{track.title}</p>
        <p className="text-xs text-white/50 truncate mt-0.5">{track.artist.name}</p>
      </div>
    );
  };

  return (
    <div className="inner-scroll h-full overflow-y-auto px-4 pt-4 pb-6 w-full max-w-3xl mx-auto flex flex-col gap-6">
      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />

      {/* Search Bar */}
      <div className="sticky top-0 pt-2 pb-2 bg-[#0a0a0a] z-40">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            search
          </span>
          <input
            className="w-full bg-[#181818] border border-transparent rounded-full py-3.5 pl-12 pr-4 text-base text-white placeholder-white/35 transition-all duration-200 focus:border-[#FF3020] focus:outline-none focus:ring-2 focus:ring-[#FF3020]/25"
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
              <div className="w-8 h-8 border-4 border-[#FF3020] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="flex flex-col gap-2">
              {searchResults.map(track => {
                const isPlaying = playingTrackId === track.id;
                return (
                  <div key={track.id} onClick={() => handlePlay(track)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img src={track.album.cover_small} className="w-full h-full object-cover" alt="" />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                         <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isPlaying ? 'pause' : 'play_arrow'}
                         </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-[#FF3020] transition-colors">{track.title}</p>
                      <p className="text-xs text-white/50 truncate">{track.artist.name}</p>
                    </div>
                    <span className="material-symbols-outlined text-white/30 text-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontVariationSettings: "'FILL' 0" }}>more_horiz</span>
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
            const tracks = genreTracks[genre.id];
            if (!tracks) {
              // Loading skeleton
              return (
                <section key={genre.id}>
                  <h2 className="text-xl font-extrabold mb-4 text-white">{genre.name}</h2>
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
              <section key={genre.id}>
                <h2 className="text-xl font-extrabold mb-4 text-white">{genre.name}</h2>
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
