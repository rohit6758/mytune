const { Innertube, UniversalCache, Platform } = require('youtubei.js');

// Required to bypass Vercel/Node environment deciphering issues
Platform.shim.eval = async (code) => {
  const script = typeof code === 'string' ? code : code.output;
  return new Function(script)();
};

let yt = null;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing query param ?q=' });
  }

  try {
    if (!yt) {
      yt = await Innertube.create({ 
        cache: new UniversalCache(false),
        generate_session_locally: true
      });
    }

    const searchResults = await yt.music.search(query, { type: 'song' });
    const firstSong = searchResults.songs?.[0] || searchResults.contents?.[0]?.contents?.[0];

    if (!firstSong || !firstSong.id) {
      return res.status(404).json({ error: 'Song not found on YouTube Music' });
    }

    const info = await yt.music.getInfo(firstSong.id);
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });

    if (!format) {
      return res.status(404).json({ error: 'No audio format found' });
    }

    // Decipher the URL so the frontend can stream it directly from Google's servers
    const url = format.has_signature 
      ? await format.decipher(yt.session.player) 
      : (format.url || await format.decipher(yt.session.player));
    
    res.status(200).json({ url });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
