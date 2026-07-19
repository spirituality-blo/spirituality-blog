export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  const idParam = url.searchParams.get('id');

  if (!idParam) {
    return next();
  }

  const response = await next();
  const html = await response.text();

  try {
    const apiUrl = `https://syncr4-api.syncr4.workers.dev/api/articles/${idParam}`;
    const apiRes = await fetch(apiUrl);

    if (!apiRes.ok) {
      return new Response(html, response);
    }

    const article = await apiRes.json();
    const title = article.title ? `${article.title} | Syncr4` : 'Syncr4 - スピリチャルブログ';
    const description = article.description || '心と魂の成長を探求するスピリチャルブログ';

    const modifiedHtml = html
      .replace(
        /<title>[^<]*<\/title>/,
        `<title>${title}</title>`
      )
      .replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${description}">`
      );

    return new Response(modifiedHtml, {
      status: response.status,
      headers: response.headers,
    });
  } catch (e) {
    return new Response(html, response);
  }
}