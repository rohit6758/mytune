import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Logo from './Logo';
import GlobalPlayer from './GlobalPlayer';
import PermissionsModal from './PermissionsModal';
import { supabase } from '../lib/supabase';

const NAV_ITEMS = [
  { name: 'Home',    path: '/discover', icon: 'home'          },
  { name: 'Search',  path: '/search',   icon: 'search'        },
  { name: 'Create',  path: '/create',   icon: 'add_circle'    },
  { name: 'Library', path: '/library',  icon: 'library_music' },
  { name: 'Profile', path: '/profile',  icon: 'person'        },
];

const BRAND = '#F5E642'; // Banana yellow

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDiscover = location.pathname === '/discover' || location.pathname === '/';
  const lastBackPress = useRef<number>(0);
  const [backToast, setBackToast] = useState(false);
  const [profile, setProfile] = useState<{ full_name?: string; username?: string; avatar_url?: string } | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('mytune_permissions_shown')) {
      setShowPermissions(true);
    }
  }, []);

  const dismissPermissions = () => {
    localStorage.setItem('mytune_permissions_shown', 'true');
    setShowPermissions(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user.user_metadata) setProfile(user.user_metadata);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [location.pathname]);

  // Double-back-to-quit
  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname === '/discover' || location.pathname === '/') {
        const now = Date.now();
        if (now - lastBackPress.current < 2000) {
          window.history.go(-(window.history.length));
        } else {
          lastBackPress.current = now;
          setBackToast(true);
          setTimeout(() => setBackToast(false), 2000);
          window.history.pushState(null, '', window.location.href);
        }
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  return (
    <div className="w-full text-white overflow-hidden flex flex-col md:flex-row relative" style={{ height: '100dvh', background: '#0a0a0f' }}>
      {showPermissions && <PermissionsModal onComplete={dismissPermissions} />}
      
      {/* Ambient background orbs */}

      <div className="ambient-orb w-96 h-96 bg-[#F5E642]/8 top-[-10%] left-[-5%]" />
      <div className="ambient-orb w-80 h-80 bg-purple-900/20 bottom-[10%] right-[-5%]" style={{ animationDelay: '4s', animationDuration: '22s' }} />

      {/* Double-back toast */}
      {backToast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[300] glass-dark text-white text-sm px-5 py-2 rounded-full">
          Press back again to exit
        </div>
      )}

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 glass-dark z-50 relative">
        <div className="p-6 overflow-y-auto inner-scroll flex-grow">
          <Logo className="w-32 h-9 mb-10" showText={true} />
          <nav className="flex flex-col gap-1">
            <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-3 ml-2">Menu</div>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => clsx(
                  'flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200',
                  isActive
                    ? 'bg-[#F5E642]/15 text-[#F5E642]'
                    : 'hover:bg-white/5 text-white/50 hover:text-white'
                )}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="material-symbols-outlined text-[22px] transition-all"
                      style={{
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                        filter: isActive ? 'drop-shadow(0 0 6px rgba(245,230,66,0.5))' : 'none',
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-semibold text-sm">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <NavLink to="/profile" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
            {profile?.avatar_url ? (
              <img alt="Profile" className="w-9 h-9 rounded-full border border-white/20 object-cover" src={profile.avatar_url} />
            ) : (
              <div className="w-9 h-9 rounded-full border border-white/20 glass flex items-center justify-center">
                <span className="material-symbols-outlined text-white/40 text-sm">person</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || profile?.username || 'Your Account'}</p>
              <p className="text-xs text-white/40 truncate">View Profile</p>
            </div>
          </NavLink>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Mobile top header — non-Discover pages */}
        {!isDiscover && (
          <header className="md:hidden flex-shrink-0 glass-dark z-50">
            <div className="flex justify-between items-center w-full px-4 h-14">
              <Logo className="w-28 h-8" showText={true} />
              <NavLink to="/profile" className="block active:scale-90 transition-transform">
                {profile?.avatar_url ? (
                  <img alt="Profile" className="w-8 h-8 rounded-full border border-white/20 object-cover" src={profile.avatar_url} />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-white/20 glass flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/40 text-sm">person</span>
                  </div>
                )}
              </NavLink>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-grow overflow-hidden w-full relative">
          <Outlet />
        </main>

        {/* ── Mobile Bottom Navigation ─────────────────────────── */}
        <nav
          className="md:hidden flex-shrink-0 w-full flex justify-around items-center z-50 relative"
          style={{
            background: 'rgba(10, 10, 18, 0.75)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: 'env(safe-area-inset-bottom, 6px)',
            paddingTop: '6px',
            height: '65px',
          }}
        >
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => clsx(
                'flex flex-col items-center justify-center gap-[3px] flex-1 py-1 transition-all duration-200 relative',
                isActive ? 'text-[#F5E642]' : 'text-white/35 hover:text-white/70'
              )}
            >
              {({ isActive }) => (
                <>
                  {/* Active pill indicator above icon */}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#F5E642]" />
                  )}
                  <span
                    className="material-symbols-outlined transition-all duration-200"
                    style={{
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                      fontSize: '23px',
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(245,230,66,0.6))' : 'none',
                    }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <GlobalPlayer />
      </div>
    </div>
  );
}
