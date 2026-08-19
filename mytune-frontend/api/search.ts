import YTMusic from 'ytmusic-api';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter q' });
    }

    const ytmusic = new YTMusic();
    await ytmusic.initialize();
    
    const results = await ytmusic.searchSongs(query);
    
    // Format to match what our frontend expects
    const formatted = results.map(item => ({
      id: item.videoId,
      title: item.name,
      artist: item.artist?.name || 'Unknown Artist',
      cover_url: item.thumbnails?.[item.thumbnails.length - 1]?.url || '',
      duration: item.duration,
    }));

    res.status(200).json(formatted);
  } catch (error: any) {
    console.error('YT Search API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
