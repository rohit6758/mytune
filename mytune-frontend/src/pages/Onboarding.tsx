import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface OnboardingProps {
  session: Session;
  onComplete: () => void;
}

export default function Onboarding({ session, onComplete }: OnboardingProps) {
  const [favoriteSinger, setFavoriteSinger] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!favoriteSinger.trim()) {
      setError('Favorite Singer is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Auto-generate a random username since we removed the username field
      const randomUsername = `user_${Math.random().toString(36).substring(2, 10)}`;

      const { error } = await supabase.from('profiles').insert([
        {
          id: session.user.id,
          username: randomUsername,
          favorite_singer: favoriteSinger.trim(),
        }
      ]);

      if (error) throw error;
      onComplete(); // Successfully created profile
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save favorite singer. Please make sure the database is updated.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#110D17] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[50vh] bg-[#8B16FF]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col items-center">
        <div className="bg-[#1A1625]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl w-full">
          <h2 className="text-2xl font-black text-white mb-2 text-center">Set Your Vibe</h2>
          <p className="text-white/60 text-sm text-center mb-6">Tell us what you listen to.</p>

          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1.5 ml-1">Favorite Singer/Artist *</label>
              <input
                type="text"
                value={favoriteSinger}
                onChange={(e) => setFavoriteSinger(e.target.value)}
                className="w-full bg-[#110D17] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D0FF00] transition-colors"
                placeholder="e.g. The Weeknd, Taylor Swift"
                required
                autoFocus
              />
              <p className="text-[10px] text-white/40 mt-2 ml-1">We'll use this to tailor your initial Discover feed so you get songs you actually like.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#8B16FF] text-white font-extrabold text-lg py-3.5 rounded-full shadow-[0_4px_14px_0_rgba(139,22,255,0.3)] hover:shadow-[0_6px_20px_rgba(139,22,255,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Setting up...' : 'Start Listening'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
