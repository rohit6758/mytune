import { NavLink, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Logo from './Logo';

const navItems = [
  { name: 'Discover', path: '/discover', icon: 'explore' },
  { name: 'Search',   path: '/search',   icon: 'search'  },
  { name: 'Create',   path: '/create',   icon: 'add_box' },
  { name: 'Profile',  path: '/profile',  icon: 'person'  },
];

export default function Layout() {
  const location = useLocation();
  const isDiscover = location.pathname === '/discover' || location.pathname === '/';

  return (
    /* Full-viewport container — no browser-level scroll */
    <div className="w-screen bg-black text-white overflow-hidden flex flex-col" style={{ height: '100dvh' }}>

      {/* ── Top Header (non-Discover pages only) ─────────────────── */}
      {!isDiscover && (
        <header className="flex-shrink-0 bg-black/95 backdrop-blur-md border-b border-white/10 z-50">
          <div className="flex justify-between items-center w-full px-4 h-14 max-w-7xl mx-auto">
            {/* Logo + wordmark */}
            <Logo className="w-28 h-9" showText={true} />

            {/* Desktop side-nav */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
              {navItems.map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => clsx(
                    'transition-colors duration-200 pb-0.5 uppercase tracking-wider text-xs font-bold',
                    isActive
                      ? 'text-[#FF6820] border-b-2 border-[#FF6820]'
                      : 'text-white/50 hover:text-white'
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
                className="w-8 h-8 rounded-full border border-[#FF6820]/40 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfj3tQSx3IVr5o2QnbJrKGzCJauZeVk0JuIodxhvhoriIUYMD5nvxBqGOPEX17ogOrbuFggejn5PgjCAn2Dyk2IwKYoH7sEa4sDsyiigbFkrpWJW5cUGWPAnSJFmfxGJzFYjXRzj8nULuwLLSbuVxvinb5V965KiKtcI2jcoO5hRUDP9yzbSEa_8_MexIatHG_VpggvPQWYaJVbh4Db6XjCNdrl4CfKHy07EWv94yzWE6pXSwQ0rwWcQ"
              />
            </button>
          </div>
        </header>
      )}

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="flex-grow overflow-hidden w-full">
        <Outlet />
      </main>

      {/* ── Bottom Navigation ─────────────────────────────────────── */}
      <nav
        className="flex-shrink-0 w-full flex justify-around items-center bg-black/95 backdrop-blur-xl border-t border-white/10 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)', paddingTop: '8px', height: '65px' }}
      >
        {navItems.map(item => {
          const isCreate = item.name === 'Create';
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => clsx(
                'flex flex-col items-center justify-center gap-0.5 flex-1 transition-all duration-200',
                isCreate ? '-mt-4' : '',
                !isCreate && (isActive ? 'text-[#FF6820]' : 'text-white/45 hover:text-white/70')
              )}
            >
              {({ isActive }) => (
                isCreate ? (
                  /* Floating Create button */
                  <div
                    className={clsx(
                      'w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90',
                      isActive
                        ? 'shadow-[#FF5520]/60 scale-105'
                        : 'shadow-[#FF6820]/40'
                    )}
                    style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF5520 50%, #FF2020 100%)' }}
                  >
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>
                      add
                    </span>
                  </div>
                ) : (
                  <>
                    <span
                      className={clsx(
                        'material-symbols-outlined transition-all',
                        isActive && 'drop-shadow-[0_0_6px_rgba(255,104,32,0.7)]'
                      )}
                      style={{
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                        fontSize: '26px',
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className={clsx('text-[10px] font-bold uppercase tracking-wider', isActive ? 'text-[#FF6820]' : '')}>
                      {item.name}
                    </span>
                  </>
                )
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
