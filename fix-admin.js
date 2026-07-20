const fs = require('fs');
let content = fs.readFileSync('C:\\Users\\edour\\Desktop\\memo-blog\\admin\\index.html', 'utf8');

content = content
  .replace(/MEMO — 管理者ページ/g, 'Syncr4 — 管理者ページ')
  .replace(/MEMO <em>Admin<\/em>/g, 'Syncr4 <em>Admin</em>')
  .replace(/memo_admin_config/g, 'syncr4_admin_config')
  .replace(/https:\/\/memo-blog-api\.xxx\.workers\.dev/g, 'https://spirituality-blog.syncr4.workers.dev')
  .replace(/副業・サイドビジネス/g, 'スピリチャル・精神世界')
  .replace(/AIツール活用/g, '瞑想・マインドフルネス')
  .replace(/フリーランス/g, '引き寄せの法則')
  .replace(/投資・マネー/g, 'ヒーリング・エネルギー')
  .replace(/スキルアップ/g, '魂・使命・覚醒')
  .replace(/ライフスタイル/g, 'チャクラ・オーラ')
  .replace(/ChatGPTを使ったライティング副業の始め方/g, '魂の目覚めとは何か')
  .replace(/Notionで副業管理を効率化する方法/g, '引き寄せの法則を実践する方法')
  .replace(/クラウドソーシングで月5万円を達成するロードマップ/g, '瞑想で内なる平和を見つける');

fs.writeFileSync('public\\admin\\index.html', content, 'utf8');
console.log('Done!');
