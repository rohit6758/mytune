import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

import Layout from './components/Layout';
import Auth from './pages/Auth';
import Discover from './pages/Discover';
import Search from './pages/Search';
import Create from './pages/Create';
import Library from './pages/Library';
import Profile from './pages/Profile';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#FF3020] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/discover" replace />} />
          <Route path="discover" element={<Discover />} />
          <Route path="search"   element={<Search />} />
          <Route path="create"   element={<Create />} />
          <Route path="library"  element={<Library />} />
          <Route path="profile"  element={<Profile session={session} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
