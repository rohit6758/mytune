import { supabase } from '../lib/supabase';

const BRAND_GRAD = 'linear-gradient(135deg, #A855F7 0%, #8B16FF 50%, #5E00D4 100%)';

export default function Profile({ session }: { session?: any }) {
  const user = session?.user;
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="inner-scroll h-full overflow-y-auto w-full max-w-3xl mx-auto flex flex-col bg-[#110D17]">
      {/* Header section */}
      <div className="relative w-full pb-6 border-b border-white/10 pt-16 flex flex-col items-center">
        {/* Abstract blurred background behind profile */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[150%] bg-[#8B16FF]/20 blur-[80px] rounded-full" />
        </div>

        {/* Profile Avatar */}
        <div className="relative z-10 w-32 h-32 rounded-full p-[3px] mb-4 shadow-2xl" style={{ background: BRAND_GRAD }}>
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#110D17] bg-[#1a1a1a] flex items-center justify-center">
             <span className="material-symbols-outlined text-white/30 text-5xl">person</span>
          </div>
        </div>

        {/* Name and Stats */}
        <div className="relative z-10 flex flex-col items-center px-4 text-center">
          <h1 className="text-3xl font-black text-white mb-1">{user?.email?.split('@')[0] || 'User'}</h1>
          <p className="text-sm text-[#D0FF00] font-bold mb-5">{user?.email}</p>
          
          {/* Sign Out Button */}
          <button 
            onClick={handleSignOut}
            className="px-8 py-2.5 rounded-full bg-[#D0FF00] text-[#110D17] text-sm font-bold shadow-[0_4px_14px_0_rgba(208,255,0,0.2)] hover:shadow-[0_6px_20px_rgba(208,255,0,0.3)] hover:-translate-y-0.5 transition-all"
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
                  <span className="material-symbols-outlined text-white/50 group-hover:text-[#D0FF00] transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
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
