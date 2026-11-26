// Đo đạc khuôn mặt từ 478 điểm MediaPipe Face Landmarker, phân loại khuôn mặt,
// tính kích thước gọng và chấm điểm từng kiểu gọng.
import { FACE_SHAPES, SHAPE_KEYS, FRAMES, SIZE_GUIDE } from './knowledge.js?v=mwxsgrv7';

export const IRIS_MM = 11.7; // đường kính mống mắt trung bình (±0.5 mm)
const CAMERA_HFOV_DEG = 60;   // góc nhìn ngang ước tính của webcam laptop

const IDX = {
  top: 10, chinTip: 152,
  cheek: [234, 454], temple: [127, 356], forehead: [54, 284], jaw: [172, 397], chin: [148, 377],
  innerCanthus: [133, 362], outerCanthus: [33, 263],
  irisA: 468, irisAring: [469, 470, 471, 472],
  irisB: 473, irisBring: [474, 475, 476, 477],
  browLower: [52, 282], cheekTop: [118, 347], noseTip: 1,
  skin: [50, 280, 151, 205, 425],
};

const pt = (lm, i, W, H) => ({ x: lm[i].x * W, y: lm[i].y * H, z: lm[i].z * W });
const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const d3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const deg = (r) => (r * 180) / Math.PI;

function angleAt(o, a, b) {
  const v1 = { x: a.x - o.x, y: a.y - o.y }, v2 = { x: b.x - o.x, y: b.y - o.y };
  const c = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y));
  return deg(Math.acos(clamp(c, -1, 1)));
}

export function poseFrom(lm, matrix, W, H) {
  const g = (i) => pt(lm, i, W, H);
  const a = g(33), b = g(263);
  const L = a.x < b.x ? a : b, R = a.x < b.x ? b : a;
  const roll = deg(Math.atan2(R.y - L.y, R.x - L.x));
  let yaw, pitch;
  if (matrix && matrix.data) {
    const m = matrix.data;
    yaw = deg(Math.asin(clamp(-m[2], -1, 1)));
    pitch = deg(Math.atan2(m[6], m[10]));
  } else {
    const n = g(IDX.noseTip), l = d2(n, g(234)), r = d2(n, g(454));
    yaw = deg(Math.asin(clamp(((l - r) / (l + r)) * 0.7, -1, 1)));
    pitch = 0;
  }
  return { yaw, pitch, roll };
}

// Đo một khung hình. Trả về số đo theo pixel và mm (thước iris).
export function measureFrame(lm, W, H) {
  const g = (i) => pt(lm, i, W, H);
  const ring = (ids) => (d2(g(ids[0]), g(ids[2])) + d2(g(ids[1]), g(ids[3]))) / 2;
  const irisPx = (ring(IDX.irisAring) + ring(IDX.irisBring)) / 2;
  const mmPerPx = IRIS_MM / irisPx;

  const eA = g(IDX.irisA), eB = g(IDX.irisB);
  const eyeL = eA.x < eB.x ? eA : eB, eyeR = eA.x < eB.x ? eB : eA;
  const eyeDist2 = d2(eyeL, eyeR);
  const ux = (eyeR.x - eyeL.x) / eyeDist2, uy = (eyeR.y - eyeL.y) / eyeDist2;
  const down = { x: -uy, y: ux }; // vuông góc đường mắt, hướng xuống cằm
  const below = (p, e) => (p.x - e.x) * down.x + (p.y - e.y) * down.y;
  const nearestEye = (p) => (d2(p, eyeL) < d2(p, eyeR) ? eyeL : eyeR);

  const browAbove = IDX.browLower.reduce((s, i) => { const p = g(i); return s - below(p, nearestEye(p)); }, 0) / 2;
  const cheekBelow = IDX.cheekTop.reduce((s, i) => { const p = g(i); return s + below(p, nearestEye(p)); }, 0) / 2;

  const w = (pair) => d3(g(pair[0]), g(pair[1]));
  const cheek = w(IDX.cheek), temple = w(IDX.temple), forehead = w(IDX.forehead), jaw = w(IDX.jaw), chin = w(IDX.chin);
  const length = d3(g(IDX.top), g(IDX.chinTip));
  const jawAngle = (angleAt(g(172), g(234), g(148)) + angleAt(g(397), g(454), g(377))) / 2;

  const pdNear = d3(eA, eB) * mmPerPx;
  const f = W / 2 / Math.tan((CAMERA_HFOV_DEG * Math.PI) / 360);
  const distanceMm = (f * IRIS_MM) / irisPx;
  // Khi nhìn vào camera ở gần, hai mắt hội tụ → PD đo được nhỏ hơn PD nhìn xa.
  const pdFar = pdNear * (1 + 10.5 / (distanceMm + 13));

  return {
    irisPx, mmPerPx, distanceMm, pdNear, pdFar,
    templeMm: temple * mmPerPx, cheekMm: cheek * mmPerPx, foreheadMm: forehead * mmPerPx,
    jawMm: jaw * mmPerPx, chinMm: chin * mmPerPx, lengthMm: length * mmPerPx,
    icdMm: d3(g(IDX.innerCanthus[0]), g(IDX.innerCanthus[1])) * mmPerPx,
    browAboveMm: browAbove * mmPerPx, cheekBelowMm: cheekBelow * mmPerPx,
    ratioLW: length / cheek, ratioJaw: jaw / cheek, ratioForehead: forehead / cheek,
    ratioChin: chin / jaw, jawAngle,
  };
}

const median = (arr) => { const s = [...arr].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

export function aggregate(samples) {
  const out = {};
  for (const k of Object.keys(samples[0])) out[k] = median(samples.map((s) => s[k]));
  out.samples = samples.length;
  return out;
}

// Trung bình & độ lệch chuẩn của các tỷ lệ theo lưới MediaPipe, hiệu chỉnh trên ảnh chân dung chính diện.
export const NORM = { ratioLW: 1.20, ratioJaw: 0.80, ratioForehead: 0.86, ratioChin: 0.23, jawAngle: 141 };
const SD = { ratioLW: 0.06, ratioJaw: 0.025, ratioForehead: 0.03, ratioChin: 0.012, jawAngle: 3.2 };
// Nguyên mẫu từng dáng mặt theo z-score: [dài/rộng, hàm, trán, cằm, góc hàm]
const PROTO = {
  oval: [0.4, -0.4, 0, -0.3, 0.3],
  round: [-1.3, 0.1, 0.3, 0, 1.0],
  square: [-1.0, 1.2, 0.3, 1.0, -1.3],
  oblong: [1.6, 0.4, 0.2, 0.3, -0.5],
  heart: [0, -1.2, 1.0, -1.1, 0.3],
  diamond: [0.3, -1.0, -1.3, -0.8, 0],
  triangle: [0, 1.3, -1.1, 0.8, -0.8],
};
const FEAT = ['ratioLW', 'ratioJaw', 'ratioForehead', 'ratioChin', 'jawAngle'];
const WEIGHT = [1.3, 1.0, 1.0, 0.8, 0.6];

export function classifyShape(m) {
  const z = FEAT.map((k) => clamp((m[k] - NORM[k]) / SD[k], -3, 3));
  const scores = {};
  let sum = 0;
  for (const s of SHAPE_KEYS) {
    let dist = 0;
    PROTO[s].forEach((p, i) => { dist += WEIGHT[i] * (z[i] - p) ** 2; });
    const prior = s === 'oval' ? 1.15 : 1;
    scores[s] = prior * Math.exp(-dist / (2 * 1.4 ** 2));
    sum += scores[s];
  }
  const probs = SHAPE_KEYS.map((s) => ({ key: s, p: scores[s] / sum })).sort((a, b) => b.p - a.p);
  return { probs, z: Object.fromEntries(FEAT.map((k, i) => [k, z[i]])) };
}

// Kích thước gọng gợi ý theo quy ước "tròng □ cầu – càng" (mm).
export function recommendSize(m) {
  const frameWidth = Math.round(clamp(m.templeMm, 118, 158));
  const bridge = Math.round(clamp(m.icdMm * 0.56, SIZE_GUIDE.bridge[0], SIZE_GUIDE.bridge[1]));
  const endpiece = 6;
  const lens = Math.round(clamp((frameWidth - bridge - 2 * endpiece) / 2, SIZE_GUIDE.lensWidth[0], SIZE_GUIDE.lensWidth[1]));
  const temple = frameWidth <= 128 ? 135 : frameWidth <= 136 ? 140 : frameWidth <= 146 ? 145 : 150;
  const cls = SIZE_GUIDE.faceClasses.find((c) => frameWidth < c.max);
  // Chiều cao tròng tối đa khi đồng tử ở 40% từ trên: viền trên không vượt lông mày quá ~3 mm,
  // đáy tròng không xuống quá gò má ~3 mm (gọng cách mặt ~12 mm nên vẫn chưa chạm).
  const maxLensHeight = Math.round(clamp(Math.min(
    (m.browAboveMm + 3) / PUPIL_FROM_TOP, (m.cheekBelowMm + 3) / (1 - PUPIL_FROM_TOP)), 26, 56));
  return { frameWidth, bridge, lens, temple, endpiece, sizeClass: cls, maxLensHeight };
}

export const SIZE_OFFSETS = { auto: 0, S: -3, M: 0, L: 3 };
// Đồng tử nằm ở ~40% chiều cao tròng tính từ viền trên (nửa trên tròng) — cách đặt kính đẹp và chuẩn quang học.
export const PUPIL_FROM_TOP = 0.4;

export function frameDims(frame, size, sizeMode = 'auto') {
  const off = SIZE_OFFSETS[sizeMode];
  let A = Math.round(size.lens * frame.widthScale + off);
  // Gọng tròng cao (tròn, panto…) thực tế dùng tròng hẹp hơn + endpiece dài hơn để vẫn đủ bề ngang.
  const maxH = size.maxLensHeight + (frame.id === 'oversized' ? 8 : 3);
  if (A * frame.aspect > maxH) A = Math.max(Math.round(maxH / frame.aspect), Math.round(A * 0.85));
  const B = frame.bridge === 'keyhole' ? size.bridge + 1 : size.bridge;
  const H = Math.round(A * frame.aspect);
  const endpiece = clamp(Math.round((size.frameWidth + 2 * off - 2 * A - B) / 2), size.endpiece, 11);
  // vOff > 0: tâm tròng nằm dưới đồng tử → đồng tử ở nửa trên tròng.
  const vOff = Math.round(H * (0.5 - PUPIL_FROM_TOP) * 10) / 10;
  return { A, B, H, vOff, endpiece, total: 2 * A + B + 2 * endpiece };
}

// Kiểm tra độ vừa vặn của một gọng với khuôn mặt (mm).
export function fitChecks(m, size, dims) {
  const checks = [];
  const widthDiff = dims.total - m.templeMm;
  checks.push(widthDiff < -5
    ? { key: 'width', ok: false, label: 'Bề ngang gọng', text: `Hẹp hơn thái dương ~${Math.abs(widthDiff).toFixed(0)} mm → càng kính có thể ép đầu, mặt trông to hơn.` }
    : widthDiff > 9
      ? { key: 'width', ok: false, label: 'Bề ngang gọng', text: `Rộng hơn thái dương ~${widthDiff.toFixed(0)} mm → dễ tuột, gọng lấn ra ngoài mặt.` }
      : { key: 'width', ok: true, label: 'Bề ngang gọng', text: `Vừa thái dương (${widthDiff >= 0 ? '+' : ''}${widthDiff.toFixed(0)} mm) — không quá một ngón tay.` });

  const framePD = dims.A + dims.B;
  const dec = (framePD - m.pdFar) / 2;
  checks.push(dec < -1
    ? { key: 'pd', ok: false, label: 'Tâm tròng – đồng tử', text: `Đồng tử lệch ra ngoài tâm tròng ${Math.abs(dec).toFixed(1)} mm/mắt — gọng quá nhỏ so với PD.` }
    : dec > 6
      ? { key: 'pd', ok: false, label: 'Tâm tròng – đồng tử', text: `Đồng tử lệch vào trong ${dec.toFixed(1)} mm/mắt — tròng phải mài lệch tâm nhiều, kính dày hơn.` }
      : { key: 'pd', ok: true, label: 'Tâm tròng – đồng tử', text: `Đồng tử gần tâm tròng (lệch ${dec.toFixed(1)} mm/mắt).` });

  const topAbove = dims.H / 2 - dims.vOff;
  const browGap = m.browAboveMm - topAbove;
  checks.push(browGap < -3
    ? { key: 'brow', ok: false, label: 'Đường lông mày', text: 'Viền trên che lông mày → gọng hơi cao/to, nét mặt bị “đè”.' }
    : browGap > 9
      ? { key: 'brow', ok: false, label: 'Đường lông mày', text: `Lông mày lộ ~${browGap.toFixed(0)} mm phía trên viền → gọng hơi thấp, mắt trông “ngạc nhiên”.` }
      : { key: 'brow', ok: true, label: 'Đường lông mày', text: 'Viền trên chạy theo đường lông mày — tự nhiên.' });

  const bottomBelow = dims.H / 2 + dims.vOff;
  const cheekGap = m.cheekBelowMm - bottomBelow;
  checks.push(cheekGap < -3
    ? { key: 'cheek', ok: false, label: 'Gò má', text: 'Đáy tròng sát gò má → có thể chạm má khi cười, để lại dấu.' }
    : { key: 'cheek', ok: true, label: 'Gò má', text: `Đáy tròng cách gò má ~${cheekGap.toFixed(0)} mm.` });

  checks.push(dims.H >= SIZE_GUIDE.progressiveMinHeight
    ? { key: 'prog', ok: true, label: 'Tròng đa tròng', text: `Cao tròng ${dims.H} mm ≥ 30 mm — làm được tròng progressive.` }
    : { key: 'prog', ok: null, label: 'Tròng đa tròng', text: `Cao tròng ${dims.H} mm < 30 mm — không hợp tròng progressive.` });
  return checks;
}

// Điểm hợp tổng hợp (0–100) cho một kiểu gọng.
export function scoreFrame(frame, analysis) {
  const { measure: m, shape, size } = analysis;
  const shapeScore = shape.probs.reduce((s, { key, p }) => s + p * frame.compat[key], 0);
  const dims = frameDims(frame, size);
  const checks = fitChecks(m, size, dims);
  const fitScore = (checks.filter((c) => c.key !== 'prog' && c.ok).length / 4) * 100;

  // Thưởng/phạt theo đặc điểm cụ thể ngoài dáng mặt.
  const z = shape.z;
  let feature = 50;
  feature += -frame.traits.topHeavy * (z.ratioForehead - z.ratioJaw) * 8; // trán rộng → nặng dưới; hàm rộng → nặng trên
  feature += (frame.aspect - 0.78) * z.ratioLW * 60;                    // mặt dài → tròng sâu
  feature += (frame.traits.angular - 0.5) * -z.jawAngle * 10;           // hàm tròn → gọng góc cạnh
  if (frame.id === 'oversized' && m.templeMm < 132) feature -= 20;
  feature = clamp(feature, 0, 100);

  const total = Math.round(0.65 * shapeScore + 0.2 * fitScore + 0.15 * feature);
  return { frame, total, shapeScore, fitScore, feature, dims, checks };
}

export function reasonsFor(result, analysis) {
  const top = analysis.shape.probs[0].key;
  const info = FACE_SHAPES[top];
  const r = [];
  const c = result.frame.compat[top];
  if (c >= 80) r.push(`Rất hợp mặt ${info.name.split(' (')[0].toLowerCase()}: ${info.goal.charAt(0).toLowerCase() + info.goal.slice(1)}`);
  else if (c < 55) r.push(`Không khuyến nghị cho mặt ${info.name.split(' (')[0].toLowerCase()}: ${info.avoid.charAt(0).toLowerCase() + info.avoid.slice(1)}`);
  const z = analysis.shape.z;
  if (result.frame.traits.topHeavy > 0.5 && z.ratioJaw - z.ratioForehead > 0.8) r.push('Nhấn phần trên giúp cân bằng đường hàm rộng.');
  if (result.frame.traits.topHeavy < -0.3 && z.ratioForehead - z.ratioJaw > 0.8) r.push('Phần dưới đầy giúp cân bằng vùng trán rộng.');
  if (result.frame.aspect >= 0.84 && z.ratioLW > 0.8) r.push('Tròng sâu làm mặt dài trông ngắn lại.');
  if (result.frame.aspect <= 0.66 && z.ratioLW > 0.8) r.push('Tròng dẹt có thể làm mặt trông dài hơn.');
  for (const ch of result.checks) if (ch.ok === false && ch.key !== 'prog') r.push(ch.text);
  return r;
}

// ---- Màu da & màu mắt ----
function srgbToLab(r, g, b) {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const R = lin(r), G = lin(g), B = lin(b);
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return { L: 116 * f(Y) - 16, a: 500 * (f(X) - f(Y)), b: 200 * (f(Y) - f(Z)) };
}

function avgPatch(img, x, y, r) {
  let R = 0, G = 0, B = 0, n = 0;
  for (let j = Math.round(y - r); j <= y + r; j++) for (let i = Math.round(x - r); i <= x + r; i++) {
    if (i < 0 || j < 0 || i >= img.width || j >= img.height) continue;
    const o = (j * img.width + i) * 4;
    R += img.data[o]; G += img.data[o + 1]; B += img.data[o + 2]; n++;
  }
  return n ? [R / n, G / n, B / n] : null;
}

// img: ImageData cùng kích thước với khung hình đã dùng để phát hiện.
export function analyzeColors(img, lm) {
  const W = img.width, H = img.height;
  const g = (i) => pt(lm, i, W, H);
  const faceW = d2(g(234), g(454));
  const labs = IDX.skin.map((i) => avgPatch(img, g(i).x, g(i).y, Math.max(2, faceW * 0.025))).filter(Boolean).map((c) => srgbToLab(...c));
  const L = median(labs.map((l) => l.L)), a = median(labs.map((l) => l.a)), b = median(labs.map((l) => l.b));
  const hue = deg(Math.atan2(b, a));
  const ita = deg(Math.atan((L - 50) / Math.max(b, 0.1)));
  const undertone = hue >= 60 ? 'warm' : hue <= 50 ? 'cool' : 'neutral';
  const depth = ita > 55 ? 'Rất sáng' : ita > 41 ? 'Sáng' : ita > 28 ? 'Trung bình' : ita > 10 ? 'Ngăm' : ita > -30 ? 'Nâu' : 'Sẫm';

  // Màu mắt: lấy vành khuyên 45–85% bán kính mống mắt, bỏ đồng tử và điểm phản sáng.
  const eyeLabs = [];
  for (const [c, ringIds] of [[IDX.irisA, IDX.irisAring], [IDX.irisB, IDX.irisBring]]) {
    const ctr = g(c); const rad = ringIds.reduce((s, i) => s + d2(ctr, g(i)), 0) / 4;
    for (let k = 0; k < 24; k++) {
      const t = (k / 24) * Math.PI * 2, rr = rad * (0.5 + 0.3 * ((k % 3) / 2));
      const p = avgPatch(img, ctr.x + Math.cos(t) * rr, ctr.y + Math.sin(t) * rr * 0.6, 0);
      if (!p) continue;
      const lab = srgbToLab(...p);
      if (lab.L > 12 && lab.L < 80) eyeLabs.push(lab);
    }
  }
  let eye = 'dark';
  if (eyeLabs.length > 6) {
    const eL = median(eyeLabs.map((l) => l.L)), ea = median(eyeLabs.map((l) => l.a)), eb = median(eyeLabs.map((l) => l.b));
    if (eb < 4 && eL > 35) eye = 'light';
    else if (ea < 2 && eb > 6 && eL > 30) eye = 'hazel';
    else if (eL > 30) eye = 'brown';
  }
  return { L, a, b, hue, ita, undertone, depth, eye };
}
