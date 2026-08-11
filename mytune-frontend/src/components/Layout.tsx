import { NavLink, Outlet } from 'react-router-dom';
import { Compass, Search, PlusCircle, User } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const navItems = [
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Create', path: '/create', icon: PlusCircle, isMain: true },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-textMain overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-surfaceHover p-6 shrink-0 z-20">
        <div className="text-2xl font-display font-bold text-primary mb-12 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background">
             M
          </div>
          MYTUNE
        </div>
        <nav className="flex-1 flex flex-col gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors",
                isActive 
                  ? "bg-primary text-background" 
                  : "text-textMuted hover:bg-surfaceHover hover:text-textMain"
              )}
            >
              <item.icon size={24} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Mobile Header (only visible on small screens for branding) */}
        <header className="md:hidden flex items-center justify-center h-14 bg-surface/80 backdrop-blur-md absolute top-0 w-full z-10 border-b border-surfaceHover">
          <div className="text-xl font-display font-bold text-primary">MYTUNE</div>
        </header>

        {/* Content Box (takes remaining height and scrolls) */}
        <div className="flex-1 h-full w-full overflow-y-auto md:pt-0 pt-14 pb-20 md:pb-0">
          <Outlet />
        </div>

        {/* Bottom Navigation for Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background border-t border-surfaceHover flex items-center justify-around px-2 pb-2 z-20">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300",
                item.isMain ? "bg-primary text-background -translate-y-4 shadow-[0_0_20px_rgba(255,107,0,0.4)]" : "text-textMuted",
                isActive && !item.isMain ? "text-primary" : ""
              )}
            >
              <item.icon size={item.isMain ? 28 : 24} />
              {!item.isMain && <span className="text-[10px] mt-1 font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
