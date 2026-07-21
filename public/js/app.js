const API_BASE = 'https://syncr4-api.syncr4.workers.dev/api';

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
    const data = await res.json();
  const articles = data.articles || [];

    if (!articles.length) {
      list.innerHTML = '<p class="loading">è¨˜äº‹ã¯ã¾ã ã‚ã‚Šã¾ã›ã‚“ã€‚</p>';
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
    list.innerHTML = '<p class="loading">èª­ã¿è¾¼ã¿ã«å¤±æ•—ã—ã¾ã—ãŸã€‚</p>';
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
        <a href="/" class="back-link">â† è¨˜äº‹ä¸€è¦§ã«æˆ»ã‚‹</a>
        <h1>${article.title}</h1>
        <p class="date">${new Date(article.created_at).toLocaleDateString('ja-JP')}</p>
        <div class="content-body">${article.content || ''}</div>
      </div>
    `;
  } catch (err) {
    detail.innerHTML = '<p class="loading">è¨˜äº‹ã®èª­ã¿è¾¼ã¿ã«å¤±æ•—ã—ã¾ã—ãŸã€‚</p>';
    console.error(err);
  }
}

// ãƒ«ãƒ¼ãƒ†ã‚£ãƒ³ã‚°
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

