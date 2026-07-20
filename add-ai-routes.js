const fs = require('fs');
const content = fs.readFileSync('src/worker.js', 'utf8');

const newRoutes = `
    // AI生成管理画面
    if (url.pathname === '/admin/ai') {
      return new Response(AI_ADMIN_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // AI記事生成API
    if (url.pathname === '/api/generate' && request.method === 'POST') {
      const adminKey = request.headers.get('X-Admin-Key');
      if (adminKey !== env.ADMIN_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers, status: 401 });
      }
      try {
        const body = await request.json();
        const title = body.title;
        const slug = body.slug || title.toLowerCase().replace(/\\s+/g, '-').replace(/[^\\w-]/g, '');

        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2000,
            messages: [{
              role: 'user',
              content: \`以下のタイトルでスピリチャルブログの記事を日本語で書いてください。\\nタイトル：\${title}\\n\\n要件：\\n- 1500〜2000文字程度\\n- HTMLタグを使用\\n- スピリチャル・精神的成長・魂・宇宙・引き寄せなどのテーマ\\n- 読者が実践できる内容を含める\\n- 最初にタイトルのh1タグは不要（本文のみ）\`
            }]
          })
        });

        const aiData = await aiRes.json();
        const content = aiData.content[0].text;
        const description = title + 'について詳しく解説します。';

        await env.DB.prepare(
          'INSERT INTO articles (title, slug, description, content, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(title, slug, description, content, new Date().toISOString()).run();

        return new Response(JSON.stringify({ success: true, title }), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { headers, status: 500 });
      }
    }
`;

const target = `    // 管理画面
    if (url.pathname === '/admin' || url.pathname === '/admin/') {`;

const modified = content.replace(target, newRoutes + '\n' + target);
fs.writeFileSync('src/worker.js', modified, 'utf8');
console.log('Done!');
