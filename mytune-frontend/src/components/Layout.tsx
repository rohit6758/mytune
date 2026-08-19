import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Logo from './Logo';
import GlobalPlayer from './GlobalPlayer';
import { supabase } from '../lib/supabase';

const NAV_ITEMS = [
  { name: 'Home',    path: '/discover', icon: 'home'          },
  { name: 'Search',  path: '/search',   icon: 'search'        },
  { name: 'Insta',   path: '/create',   icon: 'camera_alt'    },
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

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          full_name: user.user_metadata?.full_name,
          username: user.user_metadata?.username,
          avatar_url: user.user_metadata?.avatar_url,
        });
      }
    };
    fetchProfile();
  }, []);

  // Double back to quit for mobile PWA
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        window.close(); // For standalone PWA
      } else {
        lastBackPress.current = now;
        setBackToast(true);
        setTimeout(() => setBackToast(false), 2000);
        navigate(1); // prevent navigating back
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  return (
    <div className="w-full text-white overflow-hidden flex flex-col md:flex-row relative" style={{ height: '100dvh', background: '#0a0a0f' }}>
      
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
            {NAV_ITEMS.map(item => {
              const isInsta = item.name === 'Insta';
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200',
                    isActive
                      ? (isInsta ? 'bg-gradient-to-tr from-[#f09433]/15 to-[#bc1888]/15 text-white' : 'bg-[#F5E642]/15 text-[#F5E642]')
                      : 'hover:bg-white/5 text-white/50 hover:text-white'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="material-symbols-outlined transition-all"
                        style={isInsta ? {
                          fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                          background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: isActive ? 'drop-shadow(0 0 6px rgba(220,39,67,0.5))' : 'none',
                        } : {
                          fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                          filter: isActive ? 'drop-shadow(0 0 6px rgba(245,230,66,0.5))' : 'none',
                        }}
                      >
                        {item.icon}
                      </span>
                      <span className="font-semibold text-sm" style={isInsta ? {
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      } : {}}>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
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
          {NAV_ITEMS.map(item => {
            const isInsta = item.name === 'Insta';
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => clsx(
                  'flex flex-col items-center justify-center gap-[3px] flex-1 py-1 transition-all duration-200 relative',
                  isActive ? (isInsta ? 'text-white' : 'text-[#F5E642]') : 'text-white/35 hover:text-white/70'
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className={clsx("absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full", isInsta ? "bg-gradient-to-r from-[#f09433] to-[#bc1888]" : "bg-[#F5E642]")} />
                    )}
                    <span
                      className="material-symbols-outlined transition-all duration-200"
                      style={isInsta ? {
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                        fontSize: '23px',
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: isActive ? 'drop-shadow(0 0 6px rgba(220,39,67,0.6))' : 'none',
                      } : {
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                        fontSize: '23px',
                        filter: isActive ? 'drop-shadow(0 0 6px rgba(245,230,66,0.6))' : 'none',
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wide" style={isInsta ? {
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    } : {}}>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <GlobalPlayer />
      </div>
    </div>
  );
}
