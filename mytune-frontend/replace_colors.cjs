const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    file = path.join(directory, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/#000000/g, '#200F07');
  content = content.replace(/bg-black/g, 'bg-[#200F07]');
  content = content.replace(/#121212/g, '#2A1810');
  content = content.replace(/#181818/g, '#342015');
  content = content.replace(/#242424/g, '#3E271B');
  content = content.replace(/#D0FF00/g, '#C5E384');
  content = content.replace(/#8B16FF/g, '#FFF9EB');
  content = content.replace(/#A855F7/g, '#FFF9EB');
  content = content.replace(/#5E00D4/g, '#FFF9EB');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Colors replaced successfully!');
