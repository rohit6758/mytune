import ytdl from '@distube/ytdl-core';
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
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ error: 'Missing video ID parameter' });
    }

    const info = await ytdl.getInfo(id);
    
    // Prefer M4A for iOS Safari compatibility, fallback to any audio only
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio', 
      filter: format => format.hasAudio && !format.hasVideo 
    });

    if (!format || !format.url) {
      return res.status(404).json({ error: 'No suitable audio stream found' });
    }

    res.status(200).json({ url: format.url });
  } catch (error: any) {
    console.error('YT Stream API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
