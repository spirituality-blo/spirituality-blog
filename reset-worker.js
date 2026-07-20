const fs = require('fs');

const worker = `/**
 * Spirituality Blog — Cloudflare Worker API
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (path === '/api/health') {
      return json({ ok: true, ts: new Date().toISOString() });
    }

    // 記事一覧
    if (path === '/api/articles' && request.method === 'GET') {
      const search = url.searchParams.get('q') || '';
      const limit  = Math.min(parseInt(url.searchParams.get('limit') || '100'), 200);

      let query = 'SELECT id,title,tags,created_at FROM articles WHERE published=1';
      const params = [];

      if (search) {
        query += ' AND title LIKE ?';
        params.push('%' + search + '%');
      }
      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);

      const { results } = await env.DB.prepare(query).bind(...params).all();
      const articles = results.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') }));
      return json({ articles, total: articles.length });
    }

    // 記事1件
    const detailMatch = path.match(/^\\/api\\/articles\\/(\\d+)$/);
    if (detailMatch && request.method === 'GET') {
      const id = detailMatch[1];
      const row = await env.DB
        .prepare('SELECT * FROM articles WHERE id=? AND published=1')
        .bind(id).first();
      if (!row) return err('記事が見つかりません', 404);
      return json({ ...row, tags: JSON.parse(row.tags || '[]') });
    }

    // AI生成プロキシ
    if (path === '/api/generate' && request.method === 'POST') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_KEY) return err('認証エラー', 401);

      let body;
      try { body = await request.json(); }
      catch { return err('JSON parse error'); }

      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          messages: [{ role: 'user', content: body.prompt }],
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        return err('Anthropic API error: ' + aiRes.status + ' ' + errText, 502);
      }

      const aiData = await aiRes.json();
      return json(aiData);
    }

    // 記事投稿
    if (path === '/api/articles' && request.method === 'POST') {
      const key = request.headers.get('X-Admin-Key');
      if (!key || key !== env.ADMIN_KEY) return err('認証エラー', 401);

      let body;
      try { body = await request.json(); }
      catch { return err('JSON parse error'); }

      const { title, body: articleBody, tags } = body;
      if (!title || !articleBody) return err('title と body は必須です');

      const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
      const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

      const result = await env.DB
        .prepare('INSERT INTO articles (title, body, tags, created_at, updated_at, published) VALUES (?, ?, ?, ?, ?, 1)')
        .bind(title, articleBody, tagsJson, now, now)
        .run();

      return json({ ok: true, id: result.meta.last_row_id }, 201);
    }

    return err('Not found', 404);
  },
};
`;

fs.writeFileSync('src/worker.js', worker, 'utf8');
console.log('Done!');
