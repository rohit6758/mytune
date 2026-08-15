import { supabase } from '../lib/supabase';

const BRAND_GRAD = 'linear-gradient(135deg, #FF7000 0%, #FF3020 55%, #FF0000 100%)';

export default function Profile({ session }: { session?: any }) {
  const user = session?.user;
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="inner-scroll h-full overflow-y-auto w-full max-w-3xl mx-auto flex flex-col bg-[#0a0a0a]">
      {/* Header section */}
      <div className="relative w-full pb-6 border-b border-white/10 pt-16 flex flex-col items-center">
        {/* Abstract blurred background behind profile */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[150%] bg-[#FF3020]/10 blur-[80px] rounded-full" />
        </div>

        {/* Profile Avatar */}
        <div className="relative z-10 w-32 h-32 rounded-full p-[3px] mb-4 shadow-2xl" style={{ background: BRAND_GRAD }}>
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0a0a0a] bg-[#1a1a1a] flex items-center justify-center">
             <span className="material-symbols-outlined text-white/30 text-5xl">person</span>
          </div>
        </div>

        {/* Name and Stats */}
        <div className="relative z-10 flex flex-col items-center px-4 text-center">
          <h1 className="text-3xl font-black text-white mb-1">{user?.email?.split('@')[0] || 'User'}</h1>
          <p className="text-sm text-[#FF3020] font-bold mb-5">{user?.email}</p>
          
          {/* Sign Out Button */}
          <button 
            onClick={handleSignOut}
            className="px-6 py-2 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="p-6 flex flex-col gap-8">
        
        {/* Settings & Info placeholder */}
        <section>
          <h2 className="text-xl font-extrabold text-white mb-4">Settings</h2>
          <div className="flex flex-col gap-2">
            {[
              { icon: 'settings', label: 'Account Settings' },
              { icon: 'notifications', label: 'Notifications' },
              { icon: 'privacy_tip', label: 'Privacy & Security' },
              { icon: 'help', label: 'Help & Support' }
            ].map(item => (
              <button key={item.label} className="flex items-center justify-between p-4 bg-[#141414] rounded-2xl hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white/50 group-hover:text-[#FF3020] transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
                  <span className="text-white font-medium">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-white/30" style={{ fontVariationSettings: "'FILL' 0" }}>chevron_right</span>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
