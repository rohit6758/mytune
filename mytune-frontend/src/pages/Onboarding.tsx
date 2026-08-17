import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import Logo from '../components/Logo';

interface OnboardingProps { session: Session; onComplete: () => void; }

const GENRES = ['Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Country', 'Latin', 'K-Pop'];

export default function Onboarding({ session, onComplete }: OnboardingProps) {
  const [favoriteSinger, setFavoriteSinger] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!favoriteSinger.trim()) { setError('Please enter a favorite artist.'); return; }
    setLoading(true); setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { favorite_singer: favoriteSinger.trim(), genres: selectedGenres },
      });
      if (error) throw error;
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[120%] h-[50vh] rounded-full blur-[120px] bg-[#F5E642]/6 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-[80px] bg-purple-900/15 pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col items-center gap-6">
        <Logo className="w-36 h-10" showText={true} />

        <div
          className="w-full p-8 rounded-3xl flex flex-col gap-5"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div className="text-center">
            <div className="text-4xl mb-3">🎵</div>
            <h2 className="text-2xl font-black text-white">Set Your Vibe</h2>
            <p className="text-white/50 text-sm mt-1">We'll personalise your Discover feed.</p>
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm p-3 rounded-xl text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 ml-1">
                Favourite Artist / Singer *
              </label>
              <input
                type="text" value={favoriteSinger} onChange={e => setFavoriteSinger(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="e.g. The Weeknd, Taylor Swift" required autoFocus
              />
            </div>

            {/* Genre pills */}
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2.5 ml-1">
                Genres (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button
                    key={g} type="button" onClick={() => toggleGenre(g)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
                    style={
                      selectedGenres.includes(g)
                        ? { background: '#F5E642', color: '#0a0a0f', boxShadow: '0 0 12px rgba(245,230,66,0.3)' }
                        : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }
                    }
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full mt-1 font-extrabold text-base py-3.5 rounded-full transition-all hover:-translate-y-0.5 disabled:opacity-50 active:scale-95"
              style={{ background: '#F5E642', color: '#0a0a0f', boxShadow: '0 4px 20px rgba(245,230,66,0.25)' }}
            >
              {loading ? 'Setting up...' : '🎧 Start Listening'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
