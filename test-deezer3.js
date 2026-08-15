const fs = require('fs');

async function testDeezer() {
  try {
    const res = await fetch('https://api.deezer.com/chart');
    const data = await res.json();
    console.log('Chart tracks:', data.tracks.data.map(t => t.title));
  } catch(e) {
    console.error(e);
  }
}

testDeezer();
