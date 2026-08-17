import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(pwd)) return 'Password needs at least one uppercase letter.';
    if (!/[a-z]/.test(pwd)) return 'Password needs at least one lowercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password needs at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password needs at least one special character.';
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setMessage(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const passError = validatePassword(password);
        if (passError) throw new Error(passError);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
      <div className="absolute top-[-10%] left-[-5%] w-80 h-80 rounded-full blur-[100px] bg-[#F5E642]/8 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full blur-[120px] bg-purple-900/15 pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col items-center gap-8">
        <Logo className="w-44 h-12" showText={true} />

        {/* Glass card */}
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
          <h2 className="text-2xl font-black text-white text-center">
            {isLogin ? 'Welcome Back 👋' : 'Join MyTune'}
          </h2>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm p-3 rounded-xl text-center leading-relaxed">{error}</div>
          )}
          {message && (
            <div className="bg-green-500/15 border border-green-500/30 text-green-300 text-sm p-3 rounded-xl text-center leading-relaxed">{message}</div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 ml-1">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/25 transition-all text-sm"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="your@email.com" required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/25 transition-all text-sm"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="••••••••" required
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full mt-1 font-extrabold text-base py-3.5 rounded-full shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
              style={{ background: '#F5E642', color: '#0a0a0f', boxShadow: '0 4px 20px rgba(245,230,66,0.25)' }}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }}
            className="text-white/40 hover:text-white text-sm font-medium transition-colors text-center"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
