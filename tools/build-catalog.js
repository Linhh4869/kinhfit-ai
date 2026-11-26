// Chuẩn hoá dữ liệu gọng thu thập từ kinhmatanna.com (data/anna-raw.json) thành js/catalog-data.js.
// Chạy: node tools/build-catalog.js
// Mỗi dòng thô: [sku, slugSuffix, trangDang, hinhDang, chatLieu, gioiTinh, size, gia,
//                tròng, cầu, càng, banChay, moi, boSuuTap, "tên màu:#hex|…"]
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const raw = JSON.parse(fs.readFileSync(path.join(root, 'data/anna-raw.json'), 'utf8'));

const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

// Mã nội bộ của nhà cung cấp đứng trước mã hàng (VD: "XCQ-AN6202.OV-TN-…" → "AN6202").
const SUPPLIER = new Set(['XCQ', 'XCQ1', 'VNT', '1VNT', 'SO', 'ZJ', 'VX', 'HM', 'HM2', 'NX', 'YAQ', 'YAQ1', 'DJ', 'ACT', 'RH', 'ZH', 'MSL', 'YN']);
function displayCode(sku) {
  let core = sku.split('.')[0];
  const m = core.match(/^([A-Z0-9]+)-(.+)$/);
  if (m && SUPPLIER.has(m[1])) core = m[2];
  return core.replace(/\s+/g, ' ').trim();
}

// Mã màu viết tắt trong dữ liệu → tên.
const COLOR_CODES = {
  DFU: 'Đen full', TRA: 'Trắng', HON: 'Hồng', GHI: 'Ghi', DTR: 'Đen trắng', DHO: 'Đen hồng', TAH: 'Trắng hồng',
  DBO: 'Đen bóng', NAU: 'Nâu', REU: 'Rêu', SUA: 'Sữa', DLY: 'Đen lỳ', DLI: 'Đen lì', GHO: 'Ghi hồng', VAG: 'Vàng',
  TIM: 'Tím', HTA: 'Hồng trắng', DGH: 'Đen ghi', GNH: 'Ghi nhạt', GDA: 'Ghi đậm', DMO: 'Đồi mồi', DMDMO: 'Đồi mồi',
  NTA: 'Nâu trắng', TNA: 'Trắng nâu', DVA: 'Đen vàng', DEN: 'Đen', GTA: 'Ghi trắng', XDEN: 'Đen', HOV: 'Hồng vàng',
};
function cleanName(name) {
  let n = name.replace(/\s*·\s*(XXXX|\d{4})\s*$/i, '').trim();
  const codeOnly = n.match(/^C\d+([A-Z]+)$/i);
  if (codeOnly) return COLOR_CODES[codeOnly[1].toUpperCase()] || null;
  n = n.replace(/^C\d+[A-Z]*\s+/i, '').replace(/^C\d+\s*/i, '').trim();
  if (!n || /^C\d/i.test(n)) return null;
  n = n.toLowerCase().replace(/\s+\d+$/, '').replace(/^tim$/, 'tím').trim();
  return n.charAt(0).toUpperCase() + n.slice(1);
}

// Màu theo từ khoá (dùng khi dữ liệu chỉ có mã #CCCCCC giữ chỗ, và cho màu thứ hai của gọng hai tông).
const WORD_HEX = [
  ['đồi mồi', 'tortoise'], ['đen', '#151515'], ['trắng', '#e8e6e1'], ['ghi', '#8f8f8f'], ['hồng', '#d8a8a8'],
  ['nâu', '#6e4b33'], ['rêu', '#5d6b47'], ['tím', '#7c6a9c'], ['vàng', '#c8a35a'], ['sữa', '#e7d8c6'],
  ['xanh', '#4e6c8c'], ['bạc', '#c3c7cc'], ['đỏ', '#a8342e'], ['trà', '#9a8a6e'], ['vân', '#6d5c54'],
];
const PLACEHOLDER = /^#(cccccc|9a9a9a)$/i;
function wordHex(word) {
  const hit = WORD_HEX.find(([k]) => word.startsWith(k));
  return hit ? hit[1] : null;
}
function colorOf(name, hex) {
  const lower = name.toLowerCase();
  const words = lower.split(/\s+/);
  const first = wordHex(lower);
  // Phần sau màu chính: "đen trắng" → trắng; bỏ các từ mô tả độ bóng.
  const rest = lower.replace(/^(đồi mồi|\S+)\s*/, '').replace(/\b(bóng|full|lì|lỳ|nhạt|đậm|ánh)\b/g, '').trim();
  const second = rest ? wordHex(rest) : null;
  let main = first === 'tortoise' ? 'tortoise' : hex && !PLACEHOLDER.test(hex) ? hex.toLowerCase() : first || hex || '#8f8f8f';
  if (/nhạt/.test(lower) && main.startsWith('#')) main = mix(main, '#ffffff', 0.35);
  if (/đậm/.test(lower) && main.startsWith('#')) main = mix(main, '#000000', 0.25);
  const hex2 = second && second !== first ? second : null;
  const clear = /trong/.test(lower);
  return [name, main, hex2, clear ? 1 : 0];
}
function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

const out = [];
const seen = new Set();
for (const r of raw) {
  const [sku, slug, family, shapeTags, mats, gender, size, price, A, B, T, best, isNew, col, colors] = r;
  const fullSlug = slug.startsWith('@') ? slug.slice(1) : 'gong-kinh-thoi-trang-ma-hang-' + slug;
  if (seen.has(fullSlug)) continue;
  seen.add(fullSlug);
  const variants = [];
  const names = new Set();
  for (const part of colors.split('|')) {
    const i = part.lastIndexOf(':');
    const name = cleanName(part.slice(0, i));
    if (!name || names.has(name)) continue;
    names.add(name);
    variants.push(colorOf(name, part.slice(i + 1)));
  }
  if (!variants.length) variants.push(['Đen', '#151515', null, 0]);
  out.push({
    code: displayCode(sku), slug: fullSlug, family,
    tags: arr(shapeTags), materials: arr(mats), gender: arr(gender), size: arr(size)[0] || '',
    price, A, B, T, best, isNew, col: col || '', colors: variants,
  });
}

const header = `// Tự sinh bởi tools/build-catalog.js — KHÔNG sửa tay.
// Nguồn: danh mục gọng kính tại https://kinhmatanna.com/vi/products/gong-kinh (thu thập 27/11/2026).
// Chỉ gồm thông tin sản phẩm (mã, dáng, chất liệu, kích thước, màu, giá); không có hình ảnh hay mô tả của cửa hàng.
`;
fs.writeFileSync(path.join(root, 'js/catalog-data.js'), header + 'export const ANNA_PRODUCTS = ' + JSON.stringify(out) + ';\n');
console.log('products:', out.length, 'colors:', out.reduce((s, p) => s + p.colors.length, 0));
console.log(JSON.stringify(out.slice(0, 3), null, 0));
