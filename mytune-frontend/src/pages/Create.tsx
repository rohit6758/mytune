import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

/* Brand gradient — Ultraviolet Sonic */
const BRAND_GRAD = 'linear-gradient(135deg, #FFF9EB 0%, #FFF9EB 50%, #FFF9EB 100%)';

export default function Create() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importTitle, setImportTitle] = useState('');
  const [importArtist, setImportArtist] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { playTrack } = usePlayer();

  const handleImport = async () => {
    if (!importUrl) { alert('Please paste a valid link.'); return; }
    if (!importTitle) { alert('Please give this song a title.'); return; }
    if (!importArtist) { alert('Please add an artist name.'); return; }
    setIsImporting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      
      let finalAudioUrl = importUrl;

      // 1. If it's an Instagram link, try to extract via RapidAPI
      if (importUrl.includes('instagram.com/reel') || importUrl.includes('instagram.com/p')) {
        console.log('Extracting Instagram audio via RapidAPI...');
        try {
          const rapidApiRes = await fetch(`https://instagram-reels-downloader-api.p.rapidapi.com/download?url=${encodeURIComponent(importUrl)}`, {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'instagram-reels-downloader-api.p.rapidapi.com',
              'x-rapidapi-key': '5c226095d2msh2c1ed302c0fbeacp11a24ajsn961b6de22f7f'
            }
          });

          if (!rapidApiRes.ok) throw new Error('Failed to connect to RapidAPI');
          
          const rapidApiData = await rapidApiRes.json();
          if (!rapidApiData.success || !rapidApiData.data) throw new Error('API returned an error or empty data');
          
          const medias = rapidApiData.data.medias || [];
          const audioMedia = medias.find((m: any) => m.type === 'audio') || medias.find((m: any) => m.is_audio);
          
          const temporaryCdnUrl = audioMedia ? audioMedia.url : (medias[0]?.url || rapidApiData.data.url);
          if (!temporaryCdnUrl) throw new Error('Could not find media URL in response');

          // 2. Fetch the temporary audio stream directly (Instagram CDNs allow this!)
          console.log('Downloading audio to device...');
          const audioBlobRes = await fetch(temporaryCdnUrl);
          if (!audioBlobRes.ok) throw new Error('Failed to download audio stream');
          
          const audioBlob = await audioBlobRes.blob();

          // 3. Upload the Blob permanently to Supabase Storage
          console.log('Saving to Supabase...');
          const fileName = `insta-${Date.now()}.mp3`;
          const { error: uploadError } = await supabase.storage
            .from('audio')
            .upload(fileName, audioBlob, { contentType: 'audio/mpeg' });

          if (uploadError) {
            if (uploadError.message.toLowerCase().includes('bucket')) {
              throw new Error('Supabase Storage bucket "audio" not found. Please run the SQL setup script.');
            }
            throw uploadError;
          }

          // 4. Get the permanent URL
          const { data: publicData } = supabase.storage.from('audio').getPublicUrl(fileName);
          finalAudioUrl = publicData.publicUrl;
        } catch (extractionError) {
          console.warn('Extraction failed:', extractionError);
          alert('Instagram extraction failed. The API limit might be reached or the video is private. Please use the Local File Upload option instead.');
          setIsImporting(false);
          return;
        }
      }
      
      // Save track to Library
      const newTrack = {
        user_id: user.id,
        track_id: `custom-${Date.now()}`,
        title: importTitle,
        artist: importArtist,
        cover_url: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=500&q=80',
        preview_url: finalAudioUrl
      };
      
      const { error } = await supabase.from('library').insert(newTrack);
      if (error) throw error;

      // Automatically add to "Insta Songs" playlist
      if (importUrl.includes('instagram.com')) {
        let instaPlaylistId = null;
        
        // 1. Check if playlist exists
        const { data: existingPlaylists } = await supabase
          .from('playlists')
          .select('id')
          .eq('user_id', user.id)
          .ilike('name', 'Insta Songs')
          .limit(1);

        if (existingPlaylists && existingPlaylists.length > 0) {
          instaPlaylistId = existingPlaylists[0].id;
        } else {
          // 2. Create if doesn't exist
          const { data: newPlaylist, error: playlistError } = await supabase
            .from('playlists')
            .insert({ user_id: user.id, name: 'Insta Songs' })
            .select()
            .single();
          if (!playlistError && newPlaylist) {
            instaPlaylistId = newPlaylist.id;
          }
        }

        // 3. Add track to playlist
        if (instaPlaylistId) {
          await supabase.from('playlist_tracks').insert({
            playlist_id: instaPlaylistId,
            user_id: user.id,
            track_id: newTrack.track_id,
            title: newTrack.title,
            artist: newTrack.artist,
            cover_url: newTrack.cover_url,
            preview_url: newTrack.preview_url
          });
        }
      }
      
      alert('Track extracted and saved to "Insta Songs" playlist!');
      setShowImportModal(false);
      setImportUrl('');
      setImportTitle('');
      setImportArtist('');
    } catch (err: any) {
      alert('Error importing track: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prompt for title and artist since it's a local file
    const trackTitle = prompt("Enter a title for this song:", file.name.replace(/\.[^/.]+$/, ""));
    if (!trackTitle) return;
    const trackArtist = prompt("Enter the artist name:", "Local Artist") || "Local Artist";

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const fileName = `local-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('audio').getPublicUrl(fileName);
      const audioUrl = publicData.publicUrl;

      // Save to library
      const newTrack = {
        user_id: user.id,
        track_id: `custom-${Date.now()}`,
        title: trackTitle,
        artist: trackArtist,
        cover_url: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=500&q=80', // Default cover
        preview_url: audioUrl
      };
      
      const { error } = await supabase.from('library').insert(newTrack);
      if (error) throw error;

      alert('Local file uploaded and saved to Library successfully!');
    } catch (err: any) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const navigate = useNavigate();

  return (
    <div className="inner-scroll h-full overflow-y-auto px-4 pt-5 pb-6 flex flex-col gap-6">

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-6 pb-4">
        <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Ignite Your Sound
        </h2>
        <p className="text-base text-white/55 max-w-sm mx-auto leading-relaxed">
          Build the ultimate high-energy playlist or discover the raw tracks that fuel your momentum.
        </p>
      </section>

      {/* Creation Options Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">

        {/* Create New Playlist Card */}
        <button 
          onClick={() => navigate('/library')}
          className="group relative flex flex-col items-start p-6 bg-[#1A1625] rounded-3xl hover:bg-[#252031] transition-all duration-500 shadow-xl overflow-hidden border border-white/5 hover:border-[#FFF9EB]/50 text-left"
        >
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500" style={{ background: BRAND_GRAD }} />
          {/* Icon */}
          <div className="relative z-10 p-4 rounded-2xl bg-[#110D17] border border-white/5 mb-5">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1", background: BRAND_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              queue_music
            </span>
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFF9EB] transition-colors duration-300">Create New Playlist</h3>
            <p className="text-sm text-white/50 mb-5 leading-relaxed">Curate your aggression. Stack tracks for your next intense session.</p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider w-full justify-center text-white active:scale-95 transition-transform"
              style={{ background: BRAND_GRAD }}
            >
              Build Now
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
            </div>
          </div>
        </button>

        {/* Add Music Card (Insta) */}
        <button 
          onClick={() => setShowImportModal(true)}
          className="group relative flex flex-col items-start p-6 bg-[#1A1625] rounded-3xl hover:bg-[#252031] transition-all duration-500 shadow-xl overflow-hidden border border-white/5 hover:border-white/20 text-left"
        >
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500 bg-white" />
          {/* Icon */}
          <div className="relative z-10 p-4 rounded-2xl bg-[#110D17] border border-white/5 mb-5">
            <span className="material-symbols-outlined text-[40px] text-white/70" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors duration-300">Insta Extractor</h3>
            <p className="text-sm text-white/50 mb-5 leading-relaxed">Paste an Instagram link to extract and save audio.</p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider w-full justify-center text-white border border-white/25 group-hover:bg-white group-hover:text-black active:scale-95 transition-all">
              Extract Link
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>link</span>
            </div>
          </div>
        </button>

        {/* Local File Upload Card */}
        <div className="group relative flex flex-col items-start p-6 bg-[#1A1625] rounded-3xl hover:bg-[#252031] transition-all duration-500 shadow-xl overflow-hidden border border-white/5 hover:border-[#C5E384]/40 text-left sm:col-span-2 md:col-span-1 lg:col-span-3">
          <input 
            type="file" 
            accept="audio/*" 
            className="absolute inset-0 opacity-0 cursor-pointer z-20" 
            onChange={handleLocalUpload}
            disabled={isUploading}
          />
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-[#C5E384]" />
          <div className="relative z-10 flex flex-col items-center justify-center text-center w-full py-4">
            <span className="material-symbols-outlined text-[48px] text-[#C5E384] mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>
              upload_file
            </span>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#C5E384] transition-colors duration-300">
              {isUploading ? 'Uploading...' : 'Upload Local Audio'}
            </h3>
            <p className="text-sm text-white/50 max-w-sm mx-auto">Upload an MP3/WAV file directly from your device into your personal library forever.</p>
          </div>
        </div>

      </section>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1625] border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl flex flex-col gap-4">
            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C5E384]">smart_toy</span> 
              Insta Extractor
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">Paste an Instagram Reel URL. We'll strip the video, extract the pure audio, and save it to your library forever.</p>
            
            <input 
              value={importUrl} onChange={e => setImportUrl(e.target.value)}
              placeholder="Instagram Reel Link (e.g. https://www.instagram.com/reel/...)"
              className="w-full bg-[#110D17] border border-[#C5E384]/30 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C5E384] transition-colors"
            />
            <input 
              value={importTitle} onChange={e => setImportTitle(e.target.value)}
              placeholder="Give this edit a title... (Required)"
              className="w-full bg-[#110D17] border border-white/10 rounded-xl p-3 text-white placeholder-white/30"
            />
            <input 
              value={importArtist} onChange={e => setImportArtist(e.target.value)}
              placeholder="Artist Name or Editor... (Required)"
              className="w-full bg-[#110D17] border border-white/10 rounded-xl p-3 text-white placeholder-white/30"
            />
            
            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowImportModal(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20">Cancel</button>
              <button onClick={handleImport} disabled={isImporting} className="flex-1 py-3 rounded-xl bg-[#FFF9EB] text-black font-bold hover:bg-[#e6e0d4]">
                {isImporting ? 'Importing...' : 'Save Track'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
