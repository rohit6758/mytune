import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePlayer, Track } from '../context/PlayerContext';
import { searchYTSongs } from '../lib/ytmusic';

const MOODS = ['Chill', 'Commute', 'Energize', 'Feel good', 'Focus', 'Gaming', 'Party', 'Romance', 'Sad', 'Sleep', 'Workout'];
const GENRES = ['Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Country'];

export default function Search() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Explore');
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
        const results = await searchYTSongs(query);
        setSearchResults(results);
      } catch (e) {
        console.error("Search failed", e);
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
            placeholder="Search YouTube Music..."
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
        /* Default Browse View (Vivi Style) */
        <div className="flex flex-col gap-6">
          {/* Tabs */}
          <div className="flex gap-6 border-b border-white/10 pb-2">
            {['Explore', 'Suggestions', 'Album'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold relative pb-2 transition-colors ${activeTab === tab ? 'text-[#8ab4f8]' : 'text-white/50'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#8ab4f8] rounded-full" />}
              </button>
            ))}
          </div>

          {activeTab === 'Explore' && (
            <>
              {/* Moods & Moments */}
              <section>
                <h2 className="text-[#8ab4f8] text-lg font-bold mb-4 tracking-wide">Moods & moments</h2>
                <div className="grid grid-cols-2 gap-3">
                  {MOODS.map(mood => (
                    <button 
                      key={mood}
                      onClick={() => setQuery(mood + ' music')}
                      className="glass-card py-4 px-4 text-left rounded-xl hover:bg-white/10 transition-colors active:scale-95"
                    >
                      <span className="text-white text-sm font-bold">{mood}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Genres */}
              <section className="mt-4">
                <h2 className="text-[#8ab4f8] text-lg font-bold mb-4 tracking-wide">Genres</h2>
                <div className="grid grid-cols-2 gap-3">
                  {GENRES.map(genre => (
                    <button 
                      key={genre}
                      onClick={() => setQuery(genre + ' songs')}
                      className="glass-card py-4 px-4 text-left rounded-xl hover:bg-white/10 transition-colors active:scale-95"
                    >
                      <span className="text-white text-sm font-bold">{genre}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
          
          {activeTab !== 'Explore' && (
             <div className="flex flex-col items-center justify-center py-10 text-white/40 text-sm">
                Nothing to show here yet.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
