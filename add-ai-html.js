const fs = require('fs');
const content = fs.readFileSync('src/worker.js', 'utf8');

const aiAdminHtml = `
const AI_ADMIN_HTML = \`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI記事生成 | Syncr4</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: sans-serif; background: #f5f3ff; padding: 2rem; }
    h1 { color: #6c63ff; margin-bottom: 0.5rem; }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .form-group { margin-bottom: 1rem; }
    label { display: block; font-weight: bold; margin-bottom: 0.3rem; }
    input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
    textarea { width: 100%; height: 300px; padding: 0.5rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; font-family: monospace; }
    button { background: #6c63ff; color: white; border: none; padding: 0.75rem 2rem; border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 1rem; }
    button:disabled { background: #aaa; cursor: not-allowed; }
    .progress { margin-top: 1.5rem; }
    .progress-item { padding: 0.5rem; border-radius: 6px; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .progress-item.success { background: #d4edda; color: #155724; }
    .progress-item.error { background: #f8d7da; color: #721c24; }
    .progress-item.pending { background: #fff3cd; color: #856404; }
    .stats { margin-top: 1rem; font-weight: bold; color: #6c63ff; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 AI記事一括生成</h1>
    <p class="subtitle">タイトルを1行1つで入力してください（最大100件）</p>

    <div class="form-group">
      <label>管理者キー</label>
      <input type="password" id="adminKey" placeholder="管理者キーを入力">
    </div>

    <div class="form-group">
      <label>記事タイトル一覧（1行1タイトル）</label>
      <textarea id="titles" placeholder="魂の目覚めとは何か&#10;引き寄せの法則を実践する方法&#10;瞑想で内なる平和を見つける"></textarea>
    </div>

    <button id="generateBtn" onclick="startGenerate()">🚀 一括生成開始</button>

    <div class="stats" id="stats"></div>
    <div class="progress" id="progress"></div>
  </div>

  <script>
    let isRunning = false;

    async function startGenerate() {
      if (isRunning) return;
      const adminKey = document.getElementById('adminKey').value;
      const titlesText = document.getElementById('titles').value;
      const btn = document.getElementById('generateBtn');
      const progress = document.getElementById('progress');
      const stats = document.getElementById('stats');

      if (!adminKey) { alert('管理者キーを入力してください'); return; }
      if (!titlesText.trim()) { alert('タイトルを入力してください'); return; }

      const titles = titlesText.split('\\n').map(t => t.trim()).filter(t => t.length > 0);
      if (titles.length === 0) { alert('有効なタイトルがありません'); return; }

      isRunning = true;
      btn.disabled = true;
      btn.textContent = '生成中...';
      progress.innerHTML = '';

      let success = 0;
      let error = 0;

      for (let i = 0; i < titles.length; i++) {
        const title = titles[i];
        const item = document.createElement('div');
        item.className = 'progress-item pending';
        item.textContent = \`⏳ [\${i+1}/\${titles.length}] \${title}\`;
        progress.appendChild(item);
        progress.scrollTop = progress.scrollHeight;

        stats.textContent = \`進捗: \${i+1}/\${titles.length} | 成功: \${success} | エラー: \${error}\`;

        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
            body: JSON.stringify({ title })
          });
          const data = await res.json();
          if (res.ok) {
            item.className = 'progress-item success';
            item.textContent = \`✅ [\${i+1}/\${titles.length}] \${title}\`;
            success++;
          } else {
            item.className = 'progress-item error';
            item.textContent = \`❌ [\${i+1}/\${titles.length}] \${title} - \${data.error}\`;
            error++;
          }
        } catch(err) {
          item.className = 'progress-item error';
          item.textContent = \`❌ [\${i+1}/\${titles.length}] \${title} - 通信エラー\`;
          error++;
        }

        await new Promise(r => setTimeout(r, 1000));
      }

      stats.textContent = \`完了！ 成功: \${success} | エラー: \${error} | 合計: \${titles.length}\`;
      btn.disabled = false;
      btn.textContent = '🚀 一括生成開始';
      isRunning = false;
    }
  </script>
</body>
</html>\`;
`;

const target = `const ADMIN_HTML = \`<!DOCTYPE html>`;
const modified = content.replace(target, aiAdminHtml + '\n' + target);
fs.writeFileSync('src/worker.js', modified, 'utf8');
console.log('Done!');
