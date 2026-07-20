const fs = require('fs');
let content = fs.readFileSync('src/worker.js', 'utf8');
content = content.replace(
  "item.textContent = `\u23f3 [${i+1}/${titles.length}] ${title}`;",
  "item.textContent = `[${i+1}/${titles.length}] ${title} - 生成中...`;"
);
fs.writeFileSync('src/worker.js', content, 'utf8');
console.log('Done!');
