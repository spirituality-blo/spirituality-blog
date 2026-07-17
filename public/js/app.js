const API_BASE = '/api';

async function fetchArticles() {
  const container = document.getElementById('articles');
  try {
    const res = await fetch(`${API_BASE}/articles`);
    const articles = await res.json();

    if (!articles.length) {
      container.innerHTML = '<p class="loading">記事はまだありません。</p>';
      return;
    }

    container.innerHTML = articles.map(a => `
      <a class="article-card" href="/article.html?slug=${a.slug}">
        <h2>${a.title}</h2>
        <p class="desc">${a.description || ''}</p>
        <span class="date">${new Date(a.created_at).toLocaleDateString('ja-JP')}</span>
      </a>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p class="loading">読み込みに失敗しました。</p>';
    console.error(err);
  }
}

fetchArticles();