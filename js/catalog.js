// Danh mục gọng (catalog-data.js) + quy tắc dựng hình và độ hợp dáng mặt.
import { ANNA_PRODUCTS } from './catalog-data.js?v=mwy9yiwp';

// Dáng gọng. compat: điểm hợp từng dáng mặt (tổng hợp từ các hướng dẫn chọn kính).
export const FAMILIES = {
  oval: {
    name: 'Oval', shape: 'oval', aspect: 0.78, angular: 0.1, topHeavy: 0,
    compat: { oval: 85, round: 50, square: 92, oblong: 74, heart: 78, diamond: 90, triangle: 68 },
    desc: 'Đường cong mềm, thanh lịch — làm dịu nét mặt góc cạnh.',
  },
  tron: {
    name: 'Tròn', shape: 'round', aspect: 0.9, angular: 0, topHeavy: 0,
    compat: { oval: 80, round: 30, square: 95, oblong: 80, heart: 72, diamond: 72, triangle: 62 },
    desc: 'Tròng tròn cổ điển — làm mềm hàm vuông, thêm nét trẻ trung.',
  },
  vuong: {
    name: 'Vuông', shape: 'softsquare', aspect: 0.84, angular: 0.7, topHeavy: 0,
    compat: { oval: 86, round: 88, square: 38, oblong: 74, heart: 60, diamond: 58, triangle: 52 },
    desc: 'Vuông bo góc — thêm cấu trúc cho mặt tròn, tròng sâu hợp mặt dài.',
  },
  'chu-nhat': {
    name: 'Chữ nhật', shape: 'rectangle', aspect: 0.64, angular: 0.85, topHeavy: 0,
    compat: { oval: 85, round: 94, square: 38, oblong: 45, heart: 66, diamond: 60, triangle: 55 },
    desc: 'Ngang, gọn — làm mặt tròn trông dài và thon hơn, phong cách công sở.',
  },
  'da-giac': {
    name: 'Đa giác', shape: 'octagon', aspect: 0.86, angular: 0.8, topHeavy: 0,
    compat: { oval: 82, round: 88, square: 55, oblong: 64, heart: 68, diamond: 72, triangle: 66 },
    desc: 'Đa giác hiện đại — thêm góc cạnh nhẹ cho mặt tròn, thời trang.',
  },
  'mat-meo': {
    name: 'Mắt mèo', shape: 'softcateye', aspect: 0.74, angular: 0.45, topHeavy: 0.7,
    compat: { oval: 86, round: 84, square: 72, oblong: 58, heart: 52, diamond: 95, triangle: 95 },
    desc: 'Góc ngoài vểnh lên — nâng gò má, cân bằng hàm rộng.',
  },
};

export const MATERIALS = { titan: 'Titan', nhua: 'Nhựa', 'kim-loai': 'Kim loại', 'nhua-kim-loai': 'Nhựa pha kim loại' };
export const GENDERS = { nam: 'Nam', nu: 'Nữ' };
export const COLLECTIONS = { 'tet-an-chill': 'Tết An-Chill', 'the-titan': 'The Titan', 'keo-ly': 'Keo Lỳ', 'keo-ly-elite': 'Keo Lỳ Elite', 'alter-ego': 'Alter Ego' };

const WARM = ['nâu', 'vàng', 'đồi mồi', 'rêu', 'sữa', 'đỏ', 'trà', 'vân'];
const COOL = ['ghi', 'bạc', 'tím', 'xanh', 'hồng', 'trắng'];
function tonesOf(name) {
  const n = name.toLowerCase();
  if (n.startsWith('đen')) return ['neutral', 'cool'];
  if (WARM.some((w) => n.startsWith(w))) return ['warm', 'neutral'];
  if (COOL.some((w) => n.startsWith(w))) return ['cool', 'neutral'];
  return ['neutral'];
}

// Vật liệu chính để dựng hình (sản phẩm có thể gắn nhiều chất liệu).
function primaryMaterial(m) {
  const has = (k) => m.includes(k);
  if (has('nhua') && (has('kim-loai') || has('titan') || has('nhua-kim-loai'))) return 'nhua-kim-loai';
  if (has('nhua')) return 'nhua';
  if (has('titan')) return 'titan';
  if (has('kim-loai')) return 'kim-loai';
  return 'nhua-kim-loai';
}

function buildFrame(p) {
  const fam = FAMILIES[p.family] || FAMILIES.oval;
  const material = primaryMaterial(p.materials);
  const rimless = p.tags.includes('gong-khoan');
  const browline = p.tags.includes('blowline');
  const metal = material === 'titan' || material === 'kim-loai';

  let shape = fam.shape;
  if (p.tags.includes('boston')) shape = 'panto';
  if (p.tags.includes('wellington')) shape = 'wayfarer';
  if (p.family === 'da-giac' && p.tags.includes('vuong-chu-nhat')) shape = 'hexagon';
  if (rimless) shape = p.family === 'chu-nhat' || p.family === 'vuong' ? 'rimless' : shape;

  const rim = rimless ? 'rimless' : browline ? 'browline' : metal ? 'metal' : 'full';
  const thick = rim === 'browline' ? 3.6 : rim === 'rimless' ? 0.5 : material === 'titan' ? 0.75 : material === 'kim-loai' ? 1.0
    : material === 'nhua' ? 2.3 : 1.9;
  const bridge = rim === 'full' && material === 'nhua' ? (p.family === 'tron' ? 'keyhole' : 'saddle') : 'metal';

  const compat = { ...fam.compat };
  const bump = (o) => { for (const [k, v] of Object.entries(o)) compat[k] = Math.max(0, Math.min(100, compat[k] + v)); };
  if (rimless) bump({ heart: 14, diamond: 6, square: 4 });
  if (browline) bump({ heart: -20, triangle: 14, diamond: 6 });
  if (material === 'titan' || material === 'kim-loai') bump({ heart: 5 });

  const est = !p.A;
  const A = p.A || 50, B = p.B || 19, T = p.T || 145;
  const colors = p.colors.map(([name, hex, hex2, clear], i) => ({
    id: String(i), name, hex, hex2, clear: !!clear, tones: tonesOf(name), kind: metal || rim === 'rimless' ? 'metal' : 'acetate',
  }));

  const features = [MATERIALS[material], rimless ? 'không viền (khoan)' : browline ? 'browline' : null].filter(Boolean).join(', ');
  return {
    id: p.slug, code: p.code, family: p.family, familyName: fam.name,
    name: `${fam.name} ${p.code}`,
    desc: `${fam.desc} Gọng ${features.toLowerCase()}.`,
    shape, aspect: fam.aspect, rim, thick, bridge, widthScale: 1,
    traits: { angular: fam.angular, topHeavy: browline ? 1 : rimless ? -0.2 : fam.topHeavy },
    compat, material, materials: p.materials, tags: p.tags,
    gender: p.gender, size: p.size,
    A, B, temple: T, sizeEstimated: est, best: !!p.best, isNew: !!p.isNew, collection: p.col,
    colors, defaultColor: '0',
  };
}

export const FRAMES = ANNA_PRODUCTS.map(buildFrame);
