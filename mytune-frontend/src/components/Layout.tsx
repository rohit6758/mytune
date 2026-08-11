import { NavLink, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Logo from './Logo';

export default function Layout() {
  const location = useLocation();
  const isDiscover = location.pathname === '/discover' || location.pathname === '/';

  const navItems = [
    { name: 'Home', path: '/discover', icon: 'home' },
    { name: 'Search', path: '/search', icon: 'search' },
    { name: 'Create', path: '/create', icon: 'add_circle' },
    { name: 'Library', path: '/profile', icon: 'library_music' },
  ];

  return (
    // Full-viewport, no-scroll container
    <div className="w-screen h-[100dvh] bg-black text-white overflow-hidden flex flex-col">

      {/* Top Header — only on non-discover pages */}
      {!isDiscover && (
        <header className="flex-shrink-0 bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="flex justify-between items-center w-full px-4 h-14 max-w-7xl mx-auto">
            {/* Logo + wordmark */}
            <Logo className="w-24 h-8" showText={true} />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
              {navItems.map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => clsx(
                    'transition-colors duration-200 pb-0.5',
                    isActive
                      ? 'text-[#ff9900] border-b-2 border-[#ff9900]'
                      : 'text-white/60 hover:text-white'
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
                className="w-8 h-8 rounded-full border border-white/20 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfj3tQSx3IVr5o2QnbJrKGzCJauZeVk0JuIodxhvhoriIUYMD5nvxBqGOPEX17ogOrbuFggejn5PgjCAn2Dyk2IwKYoH7sEa4sDsyiigbFkrpWJW5cUGWPAnSJFmfxGJzFYjXRzj8nULuwLLSbuVxvinb5V965KiKtcI2jcoO5hRUDP9yzbSEa_8_MexIatHG_VpggvPQWYaJVbh4Db6XjCNdrl4CfKHy07EWv94yzWE6pXSwQ0rwWcQ"
              />
            </button>
          </div>
        </header>
      )}

      {/* Main page content — flex-grow, no overflow */}
      <main className="flex-grow overflow-hidden w-full">
        <Outlet />
      </main>

      {/* Bottom Navigation — always visible, fixed height */}
      <nav className="flex-shrink-0 w-full flex justify-around items-center bg-black/95 backdrop-blur-xl border-t border-white/10 z-50"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)', paddingTop: '8px', height: '65px' }}>
        {navItems.map(item => {
          const isCreate = item.name === 'Create';
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => clsx(
                'flex flex-col items-center justify-center gap-0.5 flex-1 transition-all duration-200',
                isCreate ? '-mt-4' : '',
                !isCreate && (isActive ? 'text-[#ff5540]' : 'text-white/50 hover:text-white')
              )}
            >
              {({ isActive }) => (
                isCreate ? (
                  // Floating Create button
                  <div className={clsx(
                    'w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90',
                    'bg-gradient-to-br from-[#ff9900] to-[#ff2020]',
                    'w-[52px] h-[52px]',
                    isActive ? 'shadow-[#ff5540]/50' : ''
                  )}>
                    <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      add
                    </span>
                  </div>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined transition-all"
                      style={{
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                        fontSize: '26px',
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-medium">{item.name}</span>
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
