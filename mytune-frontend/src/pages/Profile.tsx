import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const BRAND_GRAD = 'linear-gradient(135deg, #A855F7 0%, #8B16FF 50%, #5E00D4 100%)';

interface ProfileData {
  username: string;
  full_name: string;
  bio: string;
  favorite_singer: string;
}

export default function Profile({ session }: { session?: Session | null }) {
  const user = session?.user;
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>({
    username: '', full_name: '', bio: '', favorite_singer: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        const meta = user.user_metadata;
        const profileData = {
          username: meta.username || '',
          full_name: meta.full_name || '',
          bio: meta.bio || '',
          favorite_singer: meta.favorite_singer || ''
        };
        setProfile(profileData);
        setEditForm(profileData);
      }
    } catch (err) {
      console.error('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          username: editForm.username,
          full_name: editForm.full_name,
          bio: editForm.bio,
          favorite_singer: editForm.favorite_singer,
        }
      });
        
      if (error) throw error;
      setProfile(editForm);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile', err);
      alert('Failed to save profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#D0FF00] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="inner-scroll h-full overflow-y-auto w-full max-w-3xl mx-auto flex flex-col bg-[#110D17]">
      {/* Header section */}
      <div className="relative w-full pb-6 border-b border-white/10 pt-16 flex flex-col items-center px-4">
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
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md">
          {isEditing ? (
            <div className="w-full flex flex-col gap-3 mb-6 bg-[#1A1625] p-6 rounded-2xl border border-white/10 text-left">
              <div>
                <label className="text-xs text-white/50 font-bold uppercase tracking-wider">Username</label>
                <input 
                  value={editForm.username}
                  onChange={e => setEditForm({...editForm, username: e.target.value})}
                  className="w-full bg-[#110D17] border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-bold uppercase tracking-wider">Full Name</label>
                <input 
                  value={editForm.full_name}
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full bg-[#110D17] border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-bold uppercase tracking-wider">Bio</label>
                <textarea 
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full bg-[#110D17] border border-white/10 rounded-lg p-2 text-white mt-1 h-20"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-bold uppercase tracking-wider">Favorite Singer</label>
                <input 
                  value={editForm.favorite_singer}
                  onChange={e => setEditForm({...editForm, favorite_singer: e.target.value})}
                  className="w-full bg-[#110D17] border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20"
                >Cancel</button>
                <button 
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="flex-1 py-2 rounded-lg bg-[#8B16FF] text-white font-bold hover:bg-[#7200e6]"
                >{saveLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black text-white mb-1">{profile?.full_name || `@${profile?.username}`}</h1>
              {profile?.full_name && <p className="text-sm text-[#D0FF00] font-bold mb-2">@{profile?.username}</p>}
              
              {profile?.bio && <p className="text-white/80 mb-4">{profile.bio}</p>}
              
              <div className="flex items-center gap-2 bg-[#8B16FF]/20 text-[#8B16FF] px-4 py-1.5 rounded-full mb-6 text-sm font-bold border border-[#8B16FF]/30">
                <span className="material-symbols-outlined text-sm">mic</span>
                Fav Singer: {profile?.favorite_singer}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 rounded-full bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all border border-white/10"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={handleSignOut}
                  className="px-6 py-2.5 rounded-full bg-[#D0FF00] text-[#110D17] text-sm font-bold shadow-[0_4px_14px_0_rgba(208,255,0,0.2)] hover:shadow-[0_6px_20px_rgba(208,255,0,0.3)] transition-all"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Sections */}
      <div className="p-6 flex flex-col gap-8 pb-32">
        <section>
          <h2 className="text-xl font-extrabold text-white mb-4">Settings</h2>
          <div className="flex flex-col gap-2">
            {[
              { icon: 'settings', label: 'Account Settings' },
              { icon: 'notifications', label: 'Notifications' },
              { icon: 'privacy_tip', label: 'Privacy & Security' },
              { icon: 'help', label: 'Help & Support' }
            ].map(item => (
              <button key={item.label} className="flex items-center justify-between p-4 bg-[#1A1625] rounded-2xl hover:bg-white/5 transition-colors border border-white/5 group">
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
