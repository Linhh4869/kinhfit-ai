// Vẽ gọng kính 2.5D lên canvas. Toạ độ nội bộ tính bằng mm, gốc ở giữa hai đồng tử,
// x sang phải (theo ảnh), y hướng xuống.

// Hình tròng chuẩn hoá: u ∈ [-1, 1] từ phía mũi (−) ra phía thái dương (+), v từ trên (−) xuống dưới (+).
const SHAPES = {
  rectangle: { type: 'poly', pts: [[-1, -1], [1, -1], [1, 1], [-1, 1]], corner: 3.5 },
  square: { type: 'poly', pts: [[-1, -1], [1, -1], [1, 1], [-1, 1]], corner: 5 },
  oversized: { type: 'poly', pts: [[-1, -1], [1, -1.04], [1, 0.96], [-1, 1]], corner: 7 },
  wayfarer: { type: 'poly', pts: [[-0.95, -0.95], [1.08, -1.06], [0.9, 1], [-0.86, 0.94]], corner: 4.5 },
  browline: { type: 'poly', pts: [[-1, -1], [1, -1], [1, 0.45], [0.72, 1], [-0.72, 1], [-1, 0.45]], corner: 5 },
  hexagon: { type: 'poly', pts: [[-0.52, -1], [0.52, -1], [1, 0], [0.52, 1], [-0.52, 1], [-1, 0]], corner: 1.5 },
  rimless: { type: 'poly', pts: [[-1, -0.95], [1, -1], [1, 0.9], [-1, 1]], corner: 7 },
  round: { type: 'ellipse' },
  oval: { type: 'ellipse' },
  cateye: { type: 'smooth', pts: [[-0.95, -0.72], [-0.3, -0.95], [0.5, -1.0], [1.1, -1.18], [1.0, -0.35], [0.72, 0.55], [0.18, 0.98], [-0.5, 0.9], [-0.95, 0.35]] },
  aviator: { type: 'smooth', pts: [[-1, -0.82], [-0.2, -1], [0.7, -0.98], [1.02, -0.6], [0.95, 0.12], [0.6, 0.76], [0.0, 1.0], [-0.55, 0.86], [-0.92, 0.38]] },
  panto: { type: 'smooth', pts: [[-0.9, -0.88], [0, -1], [0.9, -0.88], [1.02, 0.1], [0.72, 0.8], [0, 1], [-0.72, 0.8], [-1.02, 0.1]] },
  dframe: { type: 'smooth', pts: [[-0.98, -1], [0, -1.03], [0.98, -1], [1.03, -0.25], [0.82, 0.62], [0.22, 1], [-0.42, 0.94], [-0.9, 0.5], [-1.03, -0.3]] },
};

function lensPath(ctx, shapeId, cx, cy, w, h, o) {
  const s = SHAPES[shapeId] || SHAPES.rectangle;
  const map = ([u, v]) => [cx + o * u * (w / 2), cy + v * (h / 2)];
  ctx.beginPath();
  if (s.type === 'ellipse') {
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (s.type === 'poly') {
    const p = s.pts.map(map), n = p.length;
    const r = Math.min(s.corner, w * 0.3, h * 0.3);
    const mid = [(p[n - 1][0] + p[0][0]) / 2, (p[n - 1][1] + p[0][1]) / 2];
    ctx.moveTo(mid[0], mid[1]);
    for (let i = 0; i < n; i++) ctx.arcTo(p[i][0], p[i][1], p[(i + 1) % n][0], p[(i + 1) % n][1], r);
  } else {
    const p = s.pts.map(map), n = p.length;
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
  }
  ctx.closePath();
}

let tortoiseCanvas = null;
function tortoisePattern(ctx) {
  if (!tortoiseCanvas) {
    const c = document.createElement('canvas'); c.width = c.height = 96;
    const t = c.getContext('2d');
    t.fillStyle = '#5a3417'; t.fillRect(0, 0, 96, 96);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      const col = ['#2a1508', '#8a5622', '#b07a33', '#3b1e0b', '#6b3d16'][i % 5];
      t.fillStyle = col; t.globalAlpha = 0.55 + rnd() * 0.4;
      t.beginPath(); t.ellipse(rnd() * 96, rnd() * 96, 3 + rnd() * 9, 2 + rnd() * 6, rnd() * 3, 0, Math.PI * 2); t.fill();
    }
    tortoiseCanvas = c;
  }
  const pat = ctx.createPattern(tortoiseCanvas, 'repeat');
  pat.setTransform(new DOMMatrix().scale(0.18));
  return pat;
}

function rimStyle(ctx, color) {
  if (color.hex === 'tortoise') return tortoisePattern(ctx);
  return color.hex;
}

function metalGradient(ctx, color, y0, y1) {
  if (color.kind !== 'metal') return color.hex === 'tortoise' ? '#8a5a2a' : color.hex;
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, color.hex); g.addColorStop(0.6, color.hex); g.addColorStop(1, '#333');
  return g;
}

const TINTS = {
  clear: { fill: 'rgba(200,220,235,0.07)', glare: 0.22 },
  bluelight: { fill: 'rgba(170,200,255,0.12)', glare: 0.3, edge: 'rgba(120,170,255,0.35)' },
  sun: { fill: 'rgba(25,30,35,0.72)', glare: 0.18 },
  gradient: { fill: 'grad', glare: 0.18 },
};

// T: {a,b,c,d,e,f} ma trận mm → pixel. dims: {A,B,H,vOff,endpiece}.
// Trả về vị trí bản lề (pixel) để vẽ càng kính.
export function drawGlasses(ctx, T, frame, color, dims, tint = 'clear') {
  const { A: w, B, H: h, vOff: cy, endpiece } = dims;
  const sides = [{ cx: -(w / 2 + B / 2), o: -1 }, { cx: w / 2 + B / 2, o: 1 }];
  const shape = frame.shape;
  const hinges = [];

  ctx.save();
  ctx.setTransform(T.a, T.b, T.c, T.d, T.e, T.f);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  // Tròng kính
  const tt = TINTS[tint] || TINTS.clear;
  for (const s of sides) {
    lensPath(ctx, shape, s.cx, cy, w, h, s.o);
    if (tt.fill === 'grad') {
      const g = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
      g.addColorStop(0, 'rgba(30,30,35,0.8)'); g.addColorStop(1, 'rgba(30,30,35,0.08)');
      ctx.fillStyle = g;
    } else ctx.fillStyle = tt.fill;
    ctx.fill();
    // phản sáng chéo
    ctx.save(); ctx.clip();
    const gl = ctx.createLinearGradient(s.cx - w / 2, cy - h / 2, s.cx + w / 2, cy + h / 2);
    gl.addColorStop(0, `rgba(255,255,255,${tt.glare})`); gl.addColorStop(0.35, 'rgba(255,255,255,0.02)');
    gl.addColorStop(0.55, 'rgba(255,255,255,0)'); gl.addColorStop(0.62, `rgba(255,255,255,${tt.glare * 0.5})`);
    gl.addColorStop(0.7, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.fillRect(s.cx - w, cy - h, w * 2, h * 2);
    ctx.restore();
    if (tt.edge) { ctx.strokeStyle = tt.edge; ctx.lineWidth = 0.4; ctx.stroke(); }
  }

  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1.5;
  const thick = frame.thick;
  const main = rimStyle(ctx, color);
  const metal = metalGradient(ctx, color, cy - h / 2, cy + h / 2);

  // Viền
  for (const s of sides) {
    lensPath(ctx, shape, s.cx, cy, w, h, s.o);
    if (frame.rim === 'full') {
      ctx.strokeStyle = main; ctx.lineWidth = thick; ctx.stroke();
    } else if (frame.rim === 'metal') {
      ctx.strokeStyle = metal; ctx.lineWidth = thick; ctx.stroke();
    } else if (frame.rim === 'rimless') {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.35; ctx.stroke();
    } else if (frame.rim === 'browline' || frame.rim === 'semi') {
      ctx.strokeStyle = frame.rim === 'browline' ? metalGradient(ctx, { hex: '#c9a24a', kind: 'metal' }, cy - h / 2, cy + h / 2) : 'rgba(230,235,240,0.6)';
      ctx.lineWidth = frame.rim === 'browline' ? 0.9 : 0.45; ctx.stroke();
      ctx.save();
      ctx.beginPath(); ctx.rect(s.cx - w, cy - h * 1.5, w * 2, h * (frame.rim === 'browline' ? 1.08 : 1.05)); ctx.clip();
      lensPath(ctx, shape, s.cx, cy, w, h, s.o);
      ctx.strokeStyle = main; ctx.lineWidth = thick; ctx.stroke();
      ctx.restore();
    }
    // vệt bóng trên viền nhựa
    if (frame.rim === 'full' || frame.rim === 'browline' || frame.rim === 'semi') {
      ctx.save(); ctx.shadowColor = 'transparent';
      ctx.beginPath(); ctx.rect(s.cx - w, cy - h * 1.5, w * 2, h); ctx.clip();
      lensPath(ctx, shape, s.cx, cy, w, h, s.o);
      ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = thick * 0.3; ctx.stroke();
      ctx.restore();
    }
    // Bản lề / endpiece
    const ex0 = s.cx + s.o * (w / 2 - 0.5), ey = cy - h * 0.32;
    const hx = s.cx + s.o * (w / 2 + endpiece);
    ctx.beginPath(); ctx.moveTo(ex0, ey); ctx.lineTo(hx, ey - 0.6);
    ctx.strokeStyle = frame.rim === 'full' || frame.rim === 'browline' || frame.rim === 'semi' ? main : metal;
    ctx.lineWidth = frame.rim === 'full' ? thick * 1.15 : Math.max(thick, 1.4);
    ctx.stroke();
    hinges.push(applyT(T, hx, ey - 0.6));
  }

  // Cầu mũi
  const innerX = B / 2;
  if (frame.bridge === 'double') {
    ctx.strokeStyle = metal; ctx.lineWidth = thick;
    ctx.beginPath(); ctx.moveTo(-innerX - w * 0.18, cy - h * 0.46); ctx.quadraticCurveTo(0, cy - h * 0.5, innerX + w * 0.18, cy - h * 0.46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-innerX - 0.5, cy - h * 0.2); ctx.quadraticCurveTo(0, cy - h * 0.36, innerX + 0.5, cy - h * 0.2); ctx.stroke();
  } else if (frame.bridge === 'keyhole') {
    ctx.strokeStyle = frame.rim === 'full' ? main : metal; ctx.lineWidth = thick * 1.1;
    ctx.beginPath(); ctx.moveTo(-innerX - 1, cy - h * 0.3); ctx.bezierCurveTo(-innerX * 0.7, cy - h * 0.62, innerX * 0.7, cy - h * 0.62, innerX + 1, cy - h * 0.3); ctx.stroke();
  } else if (frame.bridge === 'metal') {
    ctx.strokeStyle = frame.rim === 'browline' || frame.rim === 'semi' ? main : metal;
    ctx.lineWidth = frame.rim === 'browline' || frame.rim === 'semi' ? thick : Math.max(thick, 1.2);
    ctx.beginPath(); ctx.moveTo(-innerX - 1, cy - h * 0.38); ctx.quadraticCurveTo(0, cy - h * 0.52, innerX + 1, cy - h * 0.38); ctx.stroke();
  } else {
    ctx.strokeStyle = main; ctx.lineWidth = thick * 1.25;
    ctx.beginPath(); ctx.moveTo(-innerX - 1, cy - h * 0.25); ctx.quadraticCurveTo(0, cy - h * 0.46, innerX + 1, cy - h * 0.25); ctx.stroke();
  }

  // Đệm mũi cho gọng kim loại / không viền
  if (frame.rim !== 'full') {
    ctx.shadowColor = 'transparent';
    for (const o of [-1, 1]) {
      const px = o * (innerX + 1.2), py = cy + h * 0.12;
      ctx.strokeStyle = metal; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(o * (innerX + 0.5), cy - h * 0.25); ctx.quadraticCurveTo(o * innerX * 0.7, py - 3, px, py - 2.5); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(px, py, 1.8, 3.4, o * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.3; ctx.stroke();
    }
  }
  if (frame.rim === 'rimless') {
    for (const s of sides) for (const x of [s.cx - s.o * (w / 2 - 2), s.cx + s.o * (w / 2 - 2)]) {
      ctx.beginPath(); ctx.arc(x, cy - h * 0.32, 0.9, 0, Math.PI * 2); ctx.fillStyle = metal; ctx.fill();
    }
  }
  ctx.restore();
  return hinges;
}

function applyT(T, x, y) {
  return { x: T.a * x + T.c * y + T.e, y: T.b * x + T.d * y + T.f };
}

// Càng kính: từ bản lề (pixel) tới điểm tai (pixel).
export function drawTemples(ctx, hinges, ears, color, pxPerMm) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.lineCap = 'round';
  const style = color.hex === 'tortoise' ? '#4a2a12' : color.hex;
  hinges.forEach((hp, i) => {
    const ear = ears[i];
    const outward = i === 0 ? ear.x < hp.x - pxPerMm * 2 : ear.x > hp.x + pxPerMm * 2;
    if (!outward) return;
    const g = ctx.createLinearGradient(hp.x, hp.y, ear.x, ear.y);
    g.addColorStop(0, style); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.strokeStyle = g; ctx.lineWidth = pxPerMm * 2.2;
    ctx.beginPath(); ctx.moveTo(hp.x, hp.y); ctx.lineTo(ear.x, ear.y - pxPerMm * 2); ctx.stroke();
  });
  ctx.restore();
}

// Thumbnail cho danh mục gọng.
export function drawThumb(canvas, frame, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dims = { A: 50, B: 18, H: Math.round(50 * frame.aspect), vOff: 0, endpiece: 6 };
  const total = 2 * dims.A + dims.B + 2 * dims.endpiece + 6;
  const s = canvas.width / total;
  drawGlasses(ctx, { a: s, b: 0, c: 0, d: s, e: canvas.width / 2, f: canvas.height / 2 }, frame, color, dims, 'clear');
}
