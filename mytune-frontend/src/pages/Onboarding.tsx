import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface OnboardingProps {
  session: Session;
  onComplete: () => void;
}

export default function Onboarding({ session, onComplete }: OnboardingProps) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [favoriteSinger, setFavoriteSinger] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !favoriteSinger.trim()) {
      setError('Username and Favorite Singer are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('profiles').insert([
        {
          id: session.user.id,
          username: username.trim(),
          full_name: fullName.trim(),
          favorite_singer: favoriteSinger.trim(),
        }
      ]);

      if (error) throw error;
      onComplete(); // Successfully created profile
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create profile. The username might be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#110D17] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[50vh] bg-[#8B16FF]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col items-center">
        <div className="bg-[#1A1625]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl w-full">
          <h2 className="text-2xl font-black text-white mb-2 text-center">Complete Your Profile</h2>
          <p className="text-white/60 text-sm text-center mb-6">Let's set up your musical identity.</p>

          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1.5 ml-1">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#110D17] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#8B16FF] transition-colors"
                placeholder="e.g. musiclover99"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#110D17] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#8B16FF] transition-colors"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1.5 ml-1">Favorite Singer/Artist *</label>
              <input
                type="text"
                value={favoriteSinger}
                onChange={(e) => setFavoriteSinger(e.target.value)}
                className="w-full bg-[#110D17] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D0FF00] transition-colors"
                placeholder="Who do you listen to the most?"
                required
              />
              <p className="text-[10px] text-white/40 mt-1 ml-1">We'll use this to tailor your initial Discover feed.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#8B16FF] text-white font-extrabold text-lg py-3.5 rounded-full shadow-[0_4px_14px_0_rgba(139,22,255,0.3)] hover:shadow-[0_6px_20px_rgba(139,22,255,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Saving...' : 'Get Started'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
