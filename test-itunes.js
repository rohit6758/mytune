const fs = require('fs');

async function testItunes() {
  try {
    const res = await fetch('https://itunes.apple.com/search?term=pop&limit=3&media=music');
    const data = await res.json();
    console.log('iTunes pop tracks:', data.results.map(t => ({
      title: t.trackName,
      artist: t.artistName,
      cover: t.artworkUrl100.replace('100x100bb', '600x600bb'),
      preview: t.previewUrl
    })));
  } catch(e) {
    console.error(e);
  }
}

testItunes();
