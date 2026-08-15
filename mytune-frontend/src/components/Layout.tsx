import { NavLink, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Logo from './Logo';
import GlobalPlayer from './GlobalPlayer';

const NAV_ITEMS = [
  { name: 'Discover', path: '/discover', icon: 'explore'       },
  { name: 'Search',   path: '/search',   icon: 'search'        },
  { name: 'Create',   path: '/create',   icon: 'add_circle'    },
  { name: 'Library',  path: '/library',  icon: 'library_music' },
  { name: 'Profile',  path: '/profile',  icon: 'person'        },
];

/* Ultraviolet brand gradient */
const BRAND_GRAD = 'linear-gradient(135deg, #A855F7 0%, #8B16FF 50%, #5E00D4 100%)';

export default function Layout() {
  const location = useLocation();
  const isDiscover = location.pathname === '/discover' || location.pathname === '/';

  return (
    <div className="w-full bg-[#000000] text-white overflow-hidden flex flex-col md:flex-row" style={{ height: '100dvh' }}>

      {/* ── Desktop Sidebar Navigation (Hidden on Mobile) ────────────────── */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-[#000000] border-r border-white/5 z-50">
        <div className="p-6 overflow-y-auto inner-scroll flex-grow">
          <Logo className="w-32 h-9 mb-10" showText={true} />
          
          <nav className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-3 ml-2">Menu</div>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => clsx(
                  'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group',
                  isActive ? 'bg-[#D0FF00]/10 text-[#D0FF00]' : 'hover:bg-white/5 text-white/60 hover:text-white'
                )}
              >
                {({ isActive }) => (
                  <>
                    <span 
                      className="material-symbols-outlined text-[24px] transition-all"
                      style={{
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                        filter: isActive ? 'drop-shadow(0 0 8px rgba(208, 255, 0, 0.4))' : 'none'
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
        
        <div className="mt-auto p-6 border-t border-white/5">
          <NavLink to="/profile" className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity text-left">
            <img
              alt="Profile"
              className="w-10 h-10 rounded-full border border-[#8B16FF]/40 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfj3tQSx3IVr5o2QnbJrKGzCJauZeVk0JuIodxhvhoriIUYMD5nvxBqGOPEX17ogOrbuFggejn5PgjCAn2Dyk2IwKYoH7sEa4sDsyiigbFkrpWJW5cUGWPAnSJFmfxGJzFYjXRzj8nULuwLLSbuVxvinb5V965KiKtcI2jcoO5hRUDP9yzbSEa_8_MexIatHG_VpggvPQWYaJVbh4Db6XjCNdrl4CfKHy07EWv94yzWE6pXSwQ0rwWcQ"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Your Account</p>
              <p className="text-xs text-white/50 truncate">View Profile</p>
            </div>
          </NavLink>
        </div>
      </aside>

      {/* ── Main App Container (Right side on Desktop, Full on Mobile) ─── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* ── Mobile Top Header (non-Discover pages) ────────────────── */}
        {!isDiscover && (
          <header className="md:hidden flex-shrink-0 bg-[#000000]/95 backdrop-blur-md border-b border-white/8 z-50">
            <div className="flex justify-between items-center w-full px-4 h-14 max-w-7xl mx-auto">
              <Logo className="w-32 h-9" showText={true} />

              {/* Avatar */}
              <NavLink to="/profile" className="hover:scale-95 transition-transform block">
                <img
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-[#8B16FF]/40 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfj3tQSx3IVr5o2QnbJrKGzCJauZeVk0JuIodxhvhoriIUYMD5nvxBqGOPEX17ogOrbuFggejn5PgjCAn2Dyk2IwKYoH7sEa4sDsyiigbFkrpWJW5cUGWPAnSJFmfxGJzFYjXRzj8nULuwLLSbuVxvinb5V965KiKtcI2jcoO5hRUDP9yzbSEa_8_MexIatHG_VpggvPQWYaJVbh4Db6XjCNdrl4CfKHy07EWv94yzWE6pXSwQ0rwWcQ"
                />
              </NavLink>
            </div>
          </header>
        )}

        {/* ── Main Content ────────────────────────────────────── */}
        <main className="flex-grow overflow-hidden w-full relative">
          <Outlet />
        </main>

        {/* ── Mobile Bottom Navigation ──────────────── */}
        <nav
          className="md:hidden flex-shrink-0 w-full flex justify-around items-center bg-[#000000]/98 backdrop-blur-xl border-t border-white/8 z-50"
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
                      filter: isActive ? 'drop-shadow(0 0 5px rgba(208, 255, 0, 0.4))' : 'none',
                      color: isActive ? '#D0FF00' : undefined,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span
                    className="text-[10px] font-semibold tracking-wide transition-colors duration-200"
                    style={{ color: isActive ? '#D0FF00' : undefined }}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#D0FF00]" />
                  )}
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
