import yt from 'youtube-ext';

async function test() {
  try {
    const info = await yt.videoInfo('dQw4w9WgXcQ');
    const formats = await yt.utils.getFormats(info);
    const audioFormats = formats.filter(f => f.mimeType.startsWith('audio/'));
    console.log("SUCCESS:", audioFormats[0]?.url?.substring(0, 50));
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
