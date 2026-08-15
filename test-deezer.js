const fs = require('fs');

async function testDeezer() {
  try {
    const genresRes = await fetch('https://api.deezer.com/genre');
    const genres = await genresRes.json();
    console.log('Genres:', genres.data.map(g => `${g.id}: ${g.name}`).slice(0, 15));

    const popRes = await fetch('https://api.deezer.com/chart/132/tracks?limit=3');
    const popTracks = await popRes.json();
    console.log('Pop tracks:', popTracks.data.map(t => t.title));
  } catch(e) {
    console.error(e);
  }
}

testDeezer();
