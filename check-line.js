const fs = require('fs');
let content = fs.readFileSync('src/worker.js', 'utf8');
const lines = content.split('\n');
console.log('Line 229-233:');
for(let i=228; i<=232; i++) {
  console.log(i+1, JSON.stringify(lines[i]));
}
