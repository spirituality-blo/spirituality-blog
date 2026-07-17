export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers, status: 200 });
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', site: 'syncr4.com' }), { headers });
    }

    if (url.pathname === '/api/articles' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT id, title, slug, description, created_at FROM articles ORDER BY created_at DESC LIMIT 20'
        ).all();
        return new Response(JSON.stringify(results), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { headers, status: 500 });
      }
    }

    if (url.pathname.startsWith('/api/articles/') && request.method === 'GET') {
      const slug = url.pathname.replace('/api/articles/', '');
      try {
        const result = await env.DB.prepare(
          'SELECT * FROM articles WHERE slug = ?'
        ).bind(slug).first();
        if (!result) {
          return new Response(JSON.stringify({ error: 'Not Found' }), { headers, status: 404 });
        }
        return new Response(JSON.stringify(result), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { headers, status: 500 });
      }
    }

    if (url.pathname === '/api/articles' && request.method === 'POST') {
      const adminKey = request.headers.get('X-Admin-Key');
      if (adminKey !== env.ADMIN_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers, status: 401 });
      }
      try {
        const body = await request.json();
        await env.DB.prepare(
          'INSERT INTO articles (title, slug, description, content, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(body.title, body.slug, body.description, body.content, new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { headers, status: 500 });
      }
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), { headers, status: 404 });
  }
};