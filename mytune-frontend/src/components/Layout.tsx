import { NavLink, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Logo from './Logo';

export default function Layout() {
  const location = useLocation();
  const isDiscover = location.pathname === '/discover';

  const navItems = [
    { name: 'Discover', path: '/discover', icon: 'explore' },
    { name: 'Search', path: '/search', icon: 'search' },
    { name: 'Create', path: '/create', icon: 'add_box' },
    { name: 'Profile', path: '/profile', icon: 'person' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-on-background w-full">
      
      {/* Top Header - Hide on Discover as Discover has its own specialized header in the HTML */}
      {!isDiscover && (
        <header className="bg-black/80 backdrop-blur-md border-b border-surface-container/50 sticky top-0 z-50">
          <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 max-w-7xl mx-auto">
            <button className="flex items-center justify-center p-2 text-on-surface hover:text-primary transition-transform hover:scale-95 duration-200 md:hidden">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>menu</span>
            </button>
            
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-md font-label-bold text-label-bold">
              <Logo className="w-12 h-12 mr-4" />
              {navItems.map(item => (
                 <NavLink
                   key={item.name}
                   to={item.path}
                   className={({ isActive }) => clsx(
                     "transition-colors duration-200",
                     isActive ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-secondary-container"
                   )}
                 >
                   {item.name}
                 </NavLink>
              ))}
            </nav>

            <div className="font-display-lg text-[22px] md:hidden font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-secondary-container uppercase flex items-center gap-2">
              <Logo className="w-8 h-8" />
              mytune
            </div>

            <button className="flex items-center justify-center p-2 hover:scale-95 transition-transform">
              <img 
                alt="User profile" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-surface-container-high object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfj3tQSx3IVr5o2QnbJrKGzCJauZeVk0JuIodxhvhoriIUYMD5nvxBqGOPEX17ogOrbuFggejn5PgjCAn2Dyk2IwKYoH7sEa4sDsyiigbFkrpWJW5cUGWPAnSJFmfxGJzFYjXRzj8nULuwLLSbuVxvinb5V965KiKtcI2jcoO5hRUDP9yzbSEa_8_MexIatHG_VpggvPQWYaJVbh4Db6XjCNdrl4CfKHy07EWv94yzWE6pXSwQ0rwWcQ"
              />
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={clsx("flex-grow flex flex-col w-full", isDiscover ? "" : "pb-24")}>
        <Outlet />
      </main>

      {/* Bottom Nav - Mobile Only */}
      <nav className={clsx(
        "md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-2 border-t",
        isDiscover 
          ? "bg-black/95 backdrop-blur-2xl border-white/5 shadow-[0_-4px_25px_0_rgba(0,0,0,0.5)] rounded-t-[24px] pb-6" 
          : "bg-surface-container-lowest/90 backdrop-blur-lg border-surface-container/50 pb-[env(safe-area-inset-bottom)]"
      )}>
        {navItems.map(item => {
           // Special styling for Create button as seen in Create Content HTML
           if (item.name === 'Create' && !isDiscover) {
             return (
               <NavLink key={item.name} to={item.path} className={({ isActive }) => clsx(
                 "flex flex-col items-center justify-center -mt-6 rounded-full w-16 h-16 shadow-lg transition-transform hover:scale-105 duration-300",
                 isActive ? "bg-gradient-to-br from-primary-container to-secondary-container text-black shadow-primary-container/20" : "bg-surface-container-highest text-on-surface-variant"
               )}>
                 <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
               </NavLink>
             );
           }
           
           return (
             <NavLink key={item.name} to={item.path} className={({ isActive }) => clsx(
               "flex flex-col items-center justify-center p-2 group transition-colors",
               isDiscover ? "w-16 py-2" : "",
               isActive 
                 ? (isDiscover ? "text-tangerine bg-tangerine/10 rounded-2xl px-6" : "text-primary") 
                 : "text-on-surface-variant hover:text-primary"
             )}>
               {({ isActive }) => (
                 <>
                   <span className="material-symbols-outlined mb-1 group-hover:-translate-y-1 transition-transform" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                     {item.icon}
                   </span>
                   <span className={clsx("uppercase tracking-wider", isDiscover ? "text-[11px] font-semibold" : "font-label-sm text-[10px]")}>
                     {item.name}
                   </span>
                 </>
               )}
             </NavLink>
           );
        })}
      </nav>
    </div>
  );
}
