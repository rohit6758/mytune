import play from 'play-dl';
play.stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { discordPlayerCompatibility: true }).then(s => console.log("SUCCESS:", s.url)).catch(e => console.error("ERROR:", e));
