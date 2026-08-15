const fs = require('fs');

async function testDeezer() {
  try {
    const res = await fetch('https://api.deezer.com/search?q=pop&limit=3');
    const data = await res.json();
    console.log('Search pop tracks:', data.data.map(t => t.title));
  } catch(e) {
    console.error(e);
  }
}

testDeezer();
