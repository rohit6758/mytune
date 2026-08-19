import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

import Layout from './components/Layout';
import Auth from './pages/Auth';
import Discover from './pages/Discover';
import Search from './pages/Search';
import Create from './pages/Create';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Together from './pages/Together';

import { PlayerProvider } from './context/PlayerContext';
import Onboarding from './pages/Onboarding';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkProfile();
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile();
      else {
        setHasProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.favorite_singer) {
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      console.error('Error checking profile:', err);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#110D17] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#1A1625] p-8 rounded-3xl border border-white/10 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-4">Setup Required</h2>
          <p className="text-white/60 mb-6">
            Supabase environment variables are missing. To run MyTune, please add <code className="bg-transparent/50 px-2 py-1 rounded text-[#F5E642] text-sm">VITE_SUPABASE_URL</code> and <code className="bg-transparent/50 px-2 py-1 rounded text-[#F5E642] text-sm">VITE_SUPABASE_ANON_KEY</code> to your environment, then redeploy.
          </p>
          <div className="w-16 h-16 mx-auto border-4 border-[#FFF9EB] border-t-[#F5E642] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-[#110D17] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#F5E642] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!session) {
    return <Auth />;
  }

  if (hasProfile === false) {
    return <Onboarding session={session} onComplete={() => setHasProfile(true)} />;
  }

  return (
    <PlayerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/discover" replace />} />
            <Route path="discover" element={<Discover />} />
            <Route path="search"   element={<Search />} />
            <Route path="create"   element={<Create />} />
            <Route path="library"  element={<Library />} />
            <Route path="profile"  element={<Profile session={session} />} />
            <Route path="settings" element={<Settings />} />
            <Route path="together" element={<Together />} />
          </Route>
        </Routes>
      </Router>
    </PlayerProvider>
  );
}

export default App;
