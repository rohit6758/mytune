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
  
  content = content.replace(/#200F07/g, '#16141a');
  content = content.replace(/#2A1810/g, '#1e1b24');
  content = content.replace(/#342015/g, '#25212c');
  content = content.replace(/#3E271B/g, '#110f14');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Colors replaced successfully to Slate!');
