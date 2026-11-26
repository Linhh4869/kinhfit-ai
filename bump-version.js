// Đổi số phiên bản trong các đường dẫn ?v=… để trình duyệt tải file mới sau mỗi lần deploy.
// Chạy trước khi commit: node bump-version.js
const fs = require('fs');
const path = require('path');

const v = Date.now().toString(36);
for (const f of ['index.html', 'js/app.js', 'js/analysis.js', 'js/knowledge.js', 'js/catalog.js']) {
  const p = path.join(__dirname, f);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/\?v=[\w]+/g, `?v=${v}`));
}
console.log('Phiên bản tài nguyên:', v);
