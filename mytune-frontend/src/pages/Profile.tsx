import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const BRAND_GRAD = 'linear-gradient(135deg, #A855F7 0%, #8B16FF 50%, #5E00D4 100%)';

interface ProfileData {
  username: string;
  full_name: string;
  bio: string;
  favorite_singer: string;
  avatar_url?: string;
}

export default function Profile({ session }: { session?: Session | null }) {
  const user = session?.user;
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>({
    username: '', full_name: '', bio: '', favorite_singer: '', avatar_url: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
          favorite_singer: meta.favorite_singer || '',
          avatar_url: meta.avatar_url || ''
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingAvatar(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
         if (uploadError.message.toLowerCase().includes('bucket') || uploadError.message.toLowerCase().includes('not found')) {
            alert("Storage bucket not found! Please go to your Supabase Dashboard -> Storage, and create a public bucket named 'avatars'.");
         } else {
            throw uploadError;
         }
         return;
      }

      // 2. Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. Update User Metadata
      const newEditForm = { ...editForm, avatar_url: publicUrl };
      setEditForm(newEditForm);
      setProfile(newEditForm);

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

    } catch (err: any) {
      console.error(err);
      alert('Error uploading avatar: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#D0FF00] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="inner-scroll h-full overflow-y-auto w-full max-w-3xl mx-auto flex flex-col bg-[#110D17]">
      {/* Header section */}
      <div className="relative w-full pb-6 pt-16 flex flex-col items-center px-4">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[150%] bg-[#8B16FF]/20 blur-[80px] rounded-full" />
        </div>

        {/* Profile Avatar */}
        <div className="relative z-10 w-32 h-32 rounded-full p-[3px] mb-4 shadow-2xl" style={{ background: BRAND_GRAD }}>
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#110D17] bg-[#1a1a1a] flex items-center justify-center group">
            {profile?.avatar_url ? (
               <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
            ) : (
               <span className="material-symbols-outlined text-white/30 text-5xl">person</span>
            )}
            
            {/* Hover overlay for upload */}
            <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploadingAvatar ? (
                <div className="w-6 h-6 border-2 border-[#D0FF00] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                  <span className="text-[10px] text-white font-bold mt-1 uppercase tracking-wider">Change</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </>
              )}
            </label>
          </div>
        </div>

        {/* Name and Stats */}
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md pb-32">
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
    </div>
  );
}
