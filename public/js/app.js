const API_BASE = '/api';

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function showArticleList() {
  const list = document.getElementById('article-list');
  const detail = document.getElementById('article-detail');
  detail.style.display = 'none';
  list.style.display = 'block';

  try {
    const res = await fetch(`${API_BASE}/articles`);
    const articles = await res.json();

    if (!articles.length) {
      list.innerHTML = '<p class="loading">記事はまだありません。</p>';
      return;
    }

    list.innerHTML = `
      <div class="articles-grid">
        ${articles.map(a => `
          <a class="article-card" href="?id=${a.id}">
            <h2>${a.title}</h2>
            <p class="desc">${a.description || ''}</p>
            <span class="date">${new Date(a.created_at).toLocaleDateString('ja-JP')}</span>
          </a>
        `).join('')}
      </div>
    `;
  } catch (err) {
    list.innerHTML = '<p class="loading">読み込みに失敗しました。</p>';
    console.error(err);
  }
}

async function showArticleDetail(id) {
  const list = document.getElementById('article-list');
  const detail = document.getElementById('article-detail');
  list.style.display = 'none';
  detail.style.display = 'block';

  try {
    const res = await fetch(`${API_BASE}/articles/${id}`);
    const article = await res.json();

    document.title = `${article.title} | Syncr4`;

    detail.innerHTML = `
      <div class="article-content">
        <a href="/" class="back-link">← 記事一覧に戻る</a>
        <h1>${article.title}</h1>
        <p class="date">${new Date(article.created_at).toLocaleDateString('ja-JP')}</p>
        <div class="content-body">${article.content || ''}</div>
      </div>
    `;
  } catch (err) {
    detail.innerHTML = '<p class="loading">記事の読み込みに失敗しました。</p>';
    console.error(err);
  }
}

// ルーティング
function route() {
  const id = getIdFromUrl();
  if (id) {
    showArticleDetail(id);
  } else {
    showArticleList();
  }
}

window.addEventListener('popstate', route);
route();