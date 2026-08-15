const fs = require('fs');

async function testDeezer() {
  try {
    const popRes = await fetch('https://api.deezer.com/chart/132/tracks?limit=3');
    const popTracks = await popRes.json();
    console.log('Pop tracks response:', popTracks);
    
    const chartRes = await fetch('https://api.deezer.com/chart/0/tracks?limit=3');
    const chartTracks = await chartRes.json();
    console.log('Chart tracks:', chartTracks.data.map(t => t.title));
  } catch(e) {
    console.error(e);
  }
}

testDeezer();
