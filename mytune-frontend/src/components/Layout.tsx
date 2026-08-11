import { NavLink, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Logo from './Logo';

const NAV_ITEMS = [
  { name: 'Discover', path: '/discover', icon: 'explore'       },
  { name: 'Search',   path: '/search',   icon: 'search'        },
  { name: 'Create',   path: '/create',   icon: 'add_circle'    },
  { name: 'Library',  path: '/library',  icon: 'library_music' },
  { name: 'Profile',  path: '/profile',  icon: 'person'        },
];

/* More-red brand gradient */
const BRAND_GRAD = 'linear-gradient(135deg, #FF7000 0%, #FF3020 55%, #FF0000 100%)';

export default function Layout() {
  const location = useLocation();
  const isDiscover = location.pathname === '/discover' || location.pathname === '/';

  return (
    <div className="w-full bg-[#0a0a0a] text-white overflow-hidden flex flex-col" style={{ height: '100dvh' }}>

      {/* ── Top Header (non-Discover pages) ────────────────── */}
      {!isDiscover && (
        <header className="flex-shrink-0 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/8 z-50">
          <div className="flex justify-between items-center w-full px-4 h-14 max-w-7xl mx-auto">
            <Logo className="w-32 h-9" showText={true} />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-7">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => clsx(
                    'text-xs font-bold uppercase tracking-widest transition-all duration-200',
                    isActive
                      ? 'text-[#FF4020]'
                      : 'text-white/45 hover:text-white/80'
                  )}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Avatar */}
            <button className="hover:scale-95 transition-transform">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full border border-[#FF4020]/40 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfj3tQSx3IVr5o2QnbJrKGzCJauZeVk0JuIodxhvhoriIUYMD5nvxBqGOPEX17ogOrbuFggejn5PgjCAn2Dyk2IwKYoH7sEa4sDsyiigbFkrpWJW5cUGWPAnSJFmfxGJzFYjXRzj8nULuwLLSbuVxvinb5V965KiKtcI2jcoO5hRUDP9yzbSEa_8_MexIatHG_VpggvPQWYaJVbh4Db6XjCNdrl4CfKHy07EWv94yzWE6pXSwQ0rwWcQ"
              />
            </button>
          </div>
        </header>
      )}

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="flex-grow overflow-hidden w-full">
        <Outlet />
      </main>

      {/* ── Bottom Navigation — Spotify-style ──────────────── */}
      <nav
        className="flex-shrink-0 w-full flex justify-around items-center bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-white/8 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 6px)', paddingTop: '6px', height: '62px' }}
      >
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => clsx(
              'flex flex-col items-center justify-center gap-[3px] flex-1 py-1 transition-all duration-200 group',
              isActive ? 'text-white' : 'text-white/40 hover:text-white/65'
            )}
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined transition-all duration-200"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    fontSize: '24px',
                    /* Active icons get a subtle red glow */
                    filter: isActive ? 'drop-shadow(0 0 5px rgba(255,64,32,0.55))' : 'none',
                    color: isActive ? '#FF4020' : undefined,
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[10px] font-semibold tracking-wide transition-colors duration-200"
                  style={{ color: isActive ? '#FF4020' : undefined }}
                >
                  {item.name}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <span
                    className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{ background: BRAND_GRAD }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
