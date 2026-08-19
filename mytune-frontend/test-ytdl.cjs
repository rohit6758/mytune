const ytdl = require('@distube/ytdl-core');
async function test() {
  try {
    const info = await ytdl.getInfo('dQw4w9WgXcQ'); // Rick roll
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    console.log("SUCCESS:", format.url.substring(0, 50) + "...");
  } catch(e) {
    console.error("ERROR:", e.message);
  }
}
test();
