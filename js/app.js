import { FaceLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
import { FACE_SHAPES, FRAMES, FRAME_COLORS, UNDERTONES, EYE_COLOR_TIPS, SOURCES, SIZE_GUIDE, STYLE_TAGS, MATERIALS } from './knowledge.js?v=mwxsp2j5';
import {
  measureFrame, poseFrom, aggregate, classifyShape, recommendSize, frameDims, fitChecks,
  scoreFrame, reasonsFor, analyzeColors,
} from './analysis.js?v=mwxsp2j5';
import { drawGlasses, drawTemples, drawThumb } from './render.js?v=mwxsp2j5';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const SCAN_SAMPLES = 36;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const stage = $('#stage'), video = $('#video'), photo = $('#photo'), overlay = $('#overlay');
const octx = overlay.getContext('2d');
const grab = document.createElement('canvas');
const gctx = grab.getContext('2d', { willReadFrequently: true });
const lightC = document.createElement('canvas'); lightC.width = 64; lightC.height = 48;
const lctx = lightC.getContext('2d', { willReadFrequently: true });

const state = {
  fileset: null, videoLM: null, imageLM: null,
  mode: null, stream: null, W: 0, H: 0, lastVideoTime: -1, frameNo: 0,
  raw: null, lm: null, matrix: null, pose: null, live: null, light: null, stableFrames: 0,
  scanning: false, samples: [], colorSamples: [],
  analysis: null, results: [], undertoneOverride: null,
  frameId: 'rectangle', colorId: null, sizeMode: 'auto', tint: 'clear',
  showGlasses: true, showMesh: false, showLines: false,
  snapshots: [], cycleTimer: null,
  prefs: { styles: new Set(), material: 'any', need: 'daily' },
  affinity: {}, catalogFilter: 'all',
};

const LINE_COLORS = { temple: '#4fc3f7', cheek: '#ffb74d', forehead: '#ba68c8', jaw: '#81c784', length: '#e57373', pd: '#fff176' };
const LINE_PAIRS = { temple: [127, 356], cheek: [234, 454], forehead: [54, 284], jaw: [172, 397], length: [10, 152], pd: [468, 473] };

// ---------- Mô hình ----------
async function createLandmarker(mode) {
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath: MODEL, delegate },
    runningMode: mode, numFaces: 1,
    outputFacialTransformationMatrixes: true, outputFaceBlendshapes: false,
  });
  try { return await FaceLandmarker.createFromOptions(state.fileset, opts('GPU')); }
  catch { return FaceLandmarker.createFromOptions(state.fileset, opts('CPU')); }
}

async function initModel() {
  setStatus('Đang tải mô hình AI…');
  try {
    state.fileset = await FilesetResolver.forVisionTasks(WASM);
    state.videoLM = await createLandmarker('VIDEO');
    setStatus('Mô hình AI sẵn sàng', 'ready');
  } catch (e) {
    console.error(e);
    setStatus('Không tải được mô hình (cần Internet lần đầu)', 'error');
  }
}

let toastTimer = null;
function toast(msg) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.append(el); }
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 5000);
}

function setStatus(text, cls = '') {
  const p = $('#modelStatus');
  p.className = 'pill ' + cls;
  p.lastElementChild.textContent = text;
}

// ---------- Camera & ảnh ----------
async function startCamera() {
  if (!state.videoLM) { toast('Mô hình AI chưa tải xong, vui lòng đợi vài giây.'); return; }
  try {
    stopCamera();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false,
    });
    state.stream = stream;
    video.srcObject = stream;
    await video.play();
    setupCanvas(video.videoWidth, video.videoHeight);
    state.mode = 'camera';
    resetFace();
    stage.classList.add('mirror', 'live');
    stage.classList.remove('photo');
    afterSourceReady();
    $('#btnCamera').textContent = 'Camera đang bật';
  } catch (e) {
    console.error(e);
    toast('Không mở được camera: ' + e.message + '\nHãy cho phép trình duyệt truy cập camera, hoặc dùng “Tải ảnh”.');
  }
}

function stopCamera() {
  if (state.stream) state.stream.getTracks().forEach((t) => t.stop());
  state.stream = null;
  $('#btnCamera').textContent = 'Bật camera';
}

async function loadPhoto(src) {
  if (!state.fileset) { toast('Mô hình AI chưa tải xong, vui lòng đợi vài giây.'); return; }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Ảnh không hợp lệ'));
    img.src = src;
  });
  stopCamera();
  const scale = Math.min(1, 1280 / img.naturalWidth);
  const W = Math.round(img.naturalWidth * scale), H = Math.round(img.naturalHeight * scale);
  photo.width = W; photo.height = H;
  photo.getContext('2d').drawImage(img, 0, 0, W, H);
  setupCanvas(W, H);
  state.mode = 'photo';
  resetFace();
  stage.classList.add('photo');
  stage.classList.remove('mirror', 'live');
  afterSourceReady();
  if (!state.imageLM) state.imageLM = await createLandmarker('IMAGE');
  const res = state.imageLM.detect(photo);
  if (!res.faceLandmarks?.length) { toast('Không tìm thấy khuôn mặt trong ảnh. Hãy dùng ảnh chụp thẳng, rõ mặt.'); return; }
  handleResult(res, true);
  const m = measureFrame(state.raw, W, H);
  const colors = analyzeColors(photo.getContext('2d').getImageData(0, 0, W, H), state.raw);
  if (Math.abs(state.pose.yaw) > 12 || Math.abs(state.pose.roll) > 10) {
    toast('Ảnh hơi nghiêng — kết quả đo có thể kém chính xác. Nên dùng ảnh nhìn thẳng.');
  }
  finishAnalysis([m], [colors]);
}

function setupCanvas(W, H) {
  state.W = W; state.H = H;
  overlay.width = W; overlay.height = H;
  grab.width = W; grab.height = H;
  stage.style.aspectRatio = `${W} / ${H}`;
}

function resetFace() {
  state.raw = state.lm = state.matrix = state.pose = state.live = null;
  state.stableFrames = 0; state.lastVideoTime = -1;
  state.scanning = false; $('#scanBox').hidden = true;
}

function afterSourceReady() {
  $('#stageEmpty').hidden = true;
  $('#hud').hidden = state.mode !== 'camera';
  $('#btnScan').disabled = false;
  $('#btnSnap').disabled = false;
}

// ---------- Vòng lặp ----------
function loop() {
  if (state.mode === 'camera' && state.videoLM && video.readyState >= 2 && video.currentTime !== state.lastVideoTime) {
    state.lastVideoTime = video.currentTime;
    const res = state.videoLM.detectForVideo(video, performance.now());
    handleResult(res, false);
    state.frameNo++;
    if (state.frameNo % 15 === 0) measureLight();
    if (state.frameNo % 6 === 0) updateHud();
    if (state.scanning) scanStep();
    else if (!state.analysis && state.lm && poseOk() && ++state.stableFrames > 20) startScan();
  }
  render();
  requestAnimationFrame(loop);
}

function handleResult(res, instant) {
  const raw = res.faceLandmarks?.[0];
  stage.classList.toggle('noface', !raw);
  if (!raw) { state.raw = state.lm = null; state.stableFrames = 0; return; }
  state.raw = raw;
  state.matrix = res.facialTransformationMatrixes?.[0] || null;
  if (!state.lm || instant) state.lm = raw.map((p) => ({ ...p }));
  else {
    // làm mượt: chuyển động lớn → bám nhanh, rung nhỏ → lọc mạnh
    const move = Math.hypot(raw[1].x - state.lm[1].x, raw[1].y - state.lm[1].y) * state.W;
    const a = Math.min(0.85, 0.35 + move / 25);
    for (let i = 0; i < raw.length; i++) {
      const s = state.lm[i], r = raw[i];
      s.x += (r.x - s.x) * a; s.y += (r.y - s.y) * a; s.z += (r.z - s.z) * a;
    }
  }
  state.pose = poseFrom(raw, state.matrix, state.W, state.H);
  state.live = measureFrame(raw, state.W, state.H);
}

function poseOk() {
  const p = state.pose;
  // pitch của ma trận MediaPipe lệch ~+6° khi nhìn thẳng
  return p && Math.abs(p.yaw) < 10 && Math.abs(p.roll) < 7 && Math.abs(p.pitch - 6) < 16;
}

function distOk() {
  const d = state.live?.distanceMm;
  return d && d > 300 && d < 800;
}

function measureLight() {
  lctx.drawImage(video, 0, 0, 64, 48);
  const d = lctx.getImageData(16, 8, 32, 32).data;
  let s = 0;
  for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  state.light = s / (d.length / 4);
}

function updateHud() {
  const chip = (el, text, ok) => { el.textContent = text; el.className = 'chip ' + (ok === null ? '' : ok ? 'ok' : 'warn'); };
  if (!state.lm) {
    chip($('#hudDist'), 'Không thấy khuôn mặt — nhìn vào camera', false);
    chip($('#hudPose'), 'Góc đầu —', null);
  } else {
    const d = state.live.distanceMm / 10;
    chip($('#hudDist'), d < 30 ? `Hơi gần (${d.toFixed(0)} cm) — lùi ra` : d > 80 ? `Hơi xa (${d.toFixed(0)} cm) — lại gần` : `Khoảng cách ${d.toFixed(0)} cm`, distOk());
    const p = state.pose;
    let msg = 'Nhìn thẳng ✓';
    if (Math.abs(p.yaw) >= 10) msg = 'Quay mặt thẳng vào camera';
    else if (Math.abs(p.roll) >= 7) msg = 'Giữ đầu thẳng, không nghiêng';
    else if (Math.abs(p.pitch - 6) >= 16) msg = 'Đưa camera ngang tầm mắt';
    chip($('#hudPose'), msg, poseOk());
  }
  if (state.light != null) {
    const l = state.light;
    chip($('#hudLight'), l < 60 ? 'Thiếu sáng — bật thêm đèn' : l > 215 ? 'Quá sáng / ngược sáng' : 'Ánh sáng tốt', l >= 60 && l <= 215);
  }
}

// ---------- Quét & phân tích ----------
function startScan() {
  if (state.mode !== 'camera') return;
  stopCycle();
  state.scanning = true; state.samples = []; state.colorSamples = [];
  $('#scanBox').hidden = false;
  setScanProgress(0, 'Giữ yên, nhìn thẳng…');
}

function setScanProgress(p, msg) {
  $('#scanBar').style.strokeDashoffset = String(100 - p * 100);
  $('#scanPct').textContent = Math.round(p * 100) + '%';
  if (msg) $('#scanMsg').textContent = msg;
}

function scanStep() {
  if (!state.raw) { setScanProgress(state.samples.length / SCAN_SAMPLES, 'Không thấy khuôn mặt…'); return; }
  if (!poseOk()) { setScanProgress(state.samples.length / SCAN_SAMPLES, 'Nhìn thẳng vào camera…'); return; }
  state.samples.push(state.live);
  if (state.samples.length % 6 === 1) {
    gctx.drawImage(video, 0, 0, state.W, state.H);
    state.colorSamples.push(analyzeColors(gctx.getImageData(0, 0, state.W, state.H), state.raw));
  }
  setScanProgress(state.samples.length / SCAN_SAMPLES, 'Đang đo khuôn mặt…');
  if (state.samples.length >= SCAN_SAMPLES) {
    state.scanning = false;
    setTimeout(() => { $('#scanBox').hidden = true; }, 600);
    finishAnalysis(state.samples, state.colorSamples);
  }
}

function aggregateColors(list) {
  const med = (k) => { const s = list.map((c) => c[k]).sort((a, b) => a - b); return s[s.length >> 1]; };
  const hue = med('hue'), ita = med('ita');
  const votes = {};
  list.forEach((c) => { votes[c.eye] = (votes[c.eye] || 0) + 1; });
  const eye = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
  const undertone = hue >= 60 ? 'warm' : hue <= 50 ? 'cool' : 'neutral';
  const depth = ita > 55 ? 'Rất sáng' : ita > 41 ? 'Sáng' : ita > 28 ? 'Trung bình' : ita > 10 ? 'Ngăm' : ita > -30 ? 'Nâu' : 'Sẫm';
  return { hue, ita, eye, undertone, depth };
}

function finishAnalysis(samples, colorSamples) {
  const measure = aggregate(samples);
  const shape = classifyShape(measure);
  const size = recommendSize(measure);
  const colors = aggregateColors(colorSamples);
  state.analysis = { measure, shape, size, colors };
  state.results = FRAMES.map((f) => scoreFrame(f, state.analysis));
  $('#btnCycle').disabled = false;
  $('#btnScan').textContent = 'Phân tích lại';
  switchTab('result');
  aiPick(false);
}

// ---------- Gợi ý theo sở thích ----------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function featureKeys(f) {
  return [`id:${f.id}`, `rim:${f.rim}`, `mat:${f.material}`, `ang:${f.traits.angular > 0.6 ? 'hi' : f.traits.angular < 0.3 ? 'lo' : 'mid'}`,
    `shape:${f.shape}`, ...f.tags.map((t) => `tag:${t}`)];
}

function prefBonus(r) {
  const f = r.frame, p = state.prefs;
  let b = 0;
  if (p.styles.size) b += f.tags.some((t) => p.styles.has(t)) ? 7 : -5;
  if (p.material !== 'any') b += f.material === p.material || (f.material === 'mixed' && p.material !== 'rimless') ? 7 : -8;
  if (p.need === 'progressive') b += r.dims.H >= 32 ? 3 : r.dims.H >= 30 ? 0 : -18;
  if (p.need === 'sun') b += f.aspect >= 0.8 || f.widthScale > 1 ? 4 : -2;
  for (const k of featureKeys(f)) b += state.affinity[k] || 0;
  return clamp(b, -30, 18);
}

function prefReasons(r) {
  const out = [];
  const hit = r.frame.tags.filter((t) => state.prefs.styles.has(t));
  if (hit.length) out.push(`Đúng phong cách bạn thích: ${hit.map((t) => STYLE_TAGS[t].toLowerCase()).join(', ')}.`);
  if (state.prefs.material !== 'any' && r.bonus > 0) out.push(`Chất liệu ${MATERIALS[r.frame.material].toLowerCase()}.`);
  if (state.prefs.need === 'progressive' && r.dims.H >= 30) out.push(`Cao tròng ${r.dims.H} mm — đủ cho tròng đa tròng.`);
  if ((state.affinity[`id:${r.frame.id}`] || 0) > 0) out.push('Bạn đã thích gọng này.');
  return out;
}

function rerank() {
  for (const r of state.results) {
    if (r.base == null) r.base = r.total;
    r.bonus = prefBonus(r);
    r.total = Math.round(clamp(r.base + r.bonus, 0, 100));
  }
  state.results.sort((a, b) => b.total - a.total);
}

// Chọn gọng phù hợp nhất (dáng mặt + độ vừa + sở thích) và đeo thử ngay.
function aiPick(showcase) {
  if (!state.analysis) { toast('Hãy bật camera và nhìn thẳng để AI phân tích khuôn mặt trước.'); return; }
  stopCycle();
  rerank();
  state.userColor = false;
  state.sizeMode = 'auto';
  $$('#sizeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.size === 'auto'));
  if (state.prefs.need === 'sun') setTint('gradient');
  const best = state.results[0];
  selectFrame(best.frame.id, bestColorFor(best.frame));
  renderResults();
  renderCatalog();
  renderSwatches();
  renderReco();
  toast(`AI chọn cho bạn: ${best.frame.name} · ${currentColor().name} · ${best.total}/100`);
  if (showcase) startCycle(3);
}

function feedback(like) {
  const f = currentFrame();
  if (!state.analysis) return;
  for (const k of featureKeys(f)) state.affinity[k] = (state.affinity[k] || 0) + (k.startsWith('id:') ? (like ? 4 : -12) : like ? 1.5 : -1.5);
  rerank();
  renderResults(); renderCatalog(); renderReco();
  if (like) { selectFrame(f.id); toast(`Đã ghi nhận bạn thích ${f.name} — gợi ý được sắp xếp lại theo gu của bạn.`); return; }
  const next = state.results.find((r) => r.frame.id !== f.id);
  selectFrame(next.frame.id, state.userColor ? undefined : bestColorFor(next.frame));
  toast(`Đã bỏ qua ${f.name}. Thử gợi ý tiếp theo: ${next.frame.name}.`);
}

function setTint(t) {
  state.tint = t;
  $$('#tintSeg button').forEach((b) => b.classList.toggle('on', b.dataset.tint === t));
}

function renderReco() {
  const box = $('#recoStrip');
  if (!state.results.length) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `<div class="reco-head">AI gợi ý cho bạn</div>${state.results.slice(0, 3).map((r, i) => `
    <button class="reco-item ${r.frame.id === state.frameId ? 'on' : ''}" data-try="${r.frame.id}">
      <canvas width="150" height="52" data-thumb="${r.frame.id}"></canvas>
      <span><b>${i + 1}. ${r.frame.name}</b><i>${r.total}/100</i></span>
    </button>`).join('')}`;
  box.querySelectorAll('canvas[data-thumb]').forEach((cv) => {
    const f = FRAMES.find((x) => x.id === cv.dataset.thumb);
    drawThumb(cv, f, FRAME_COLORS.find((c) => c.id === bestColorFor(f)));
  });
}

function aiBlockHtml() {
  const best = state.results[0];
  const A = state.analysis;
  const why = [...prefReasons(best), ...reasonsFor(best, A)].slice(0, 4);
  const chip = (attr, val, on, label) => `<button class="chip-btn ${on ? 'on' : ''}" ${attr}="${val}">${label}</button>`;
  return `
    <div class="ai-pick">
      <div class="conf">AI gợi ý gọng phù hợp nhất</div>
      <div class="ai-best">
        <canvas width="300" height="104" data-thumb="${best.frame.id}"></canvas>
        <div>
          <div class="name">${best.frame.name} <span class="score ${scoreCls(best.total)}">${best.total}</span></div>
          <p class="muted">${MATERIALS[best.frame.material]} · ${best.dims.A}□${best.dims.B}–${A.size.temple} · ${FRAME_COLORS.find((c) => c.id === bestColorFor(best.frame)).name}</p>
          <ul>${why.map((x) => `<li>${x}</li>`).join('')}</ul>
          <div class="row" style="justify-content:flex-start">
            <button class="btn primary small" data-try="${best.frame.id}">Đeo thử</button>
            <button class="btn small" data-showcase="1">Xem lần lượt Top 3</button>
          </div>
        </div>
      </div>
      <div class="prefs">
        <h4>Phong cách bạn thích <span class="muted">(chọn nhiều)</span></h4>
        <div class="chips">${Object.entries(STYLE_TAGS).map(([k, v]) => chip('data-pref-style', k, state.prefs.styles.has(k), v)).join('')}</div>
        <h4>Chất liệu</h4>
        <div class="chips">${chip('data-pref-mat', 'any', state.prefs.material === 'any', 'Bất kỳ')}${Object.entries(MATERIALS).filter(([k]) => k !== 'mixed').map(([k, v]) => chip('data-pref-mat', k, state.prefs.material === k, v)).join('')}</div>
        <h4>Nhu cầu</h4>
        <div class="chips">${[['daily', 'Đeo hằng ngày'], ['progressive', 'Tròng đa tròng'], ['sun', 'Kính râm']].map(([k, v]) => chip('data-pref-need', k, state.prefs.need === k, v)).join('')}</div>
      </div>
      <button class="btn primary" data-ai-pick="1" style="width:100%;justify-content:center;margin-top:12px">AI chọn giúp tôi</button>
      <p class="muted" style="margin:8px 0 0">Mẹo: bấm <b>Thích / Bỏ qua</b> ở góc khung camera — AI học gu của bạn và xếp lại gợi ý.</p>
    </div>`;
}

function undertone() {
  return state.undertoneOverride || state.analysis?.colors.undertone || 'neutral';
}

function bestColorFor(frame) {
  const tone = undertone();
  const def = FRAME_COLORS.find((c) => c.id === frame.defaultColor);
  if (!state.analysis || def.tones.includes(tone)) return def.id;
  const sameKind = FRAME_COLORS.find((c) => c.kind === def.kind && c.tones.includes(tone));
  return (sameKind || FRAME_COLORS.find((c) => c.tones.includes(tone))).id;
}

// ---------- Vẽ ----------
function render() {
  octx.setTransform(1, 0, 0, 1, 0, 0);
  octx.clearRect(0, 0, overlay.width, overlay.height);
  if (!state.lm) return;
  drawScene(octx, { mesh: state.showMesh, lines: state.showLines, glasses: state.showGlasses });
}

function drawScene(ctx, opts) {
  const lm = state.lm, W = state.W, H = state.H;
  const g = (i) => ({ x: lm[i].x * W, y: lm[i].y * H, z: lm[i].z * W });
  if (opts.mesh) {
    ctx.fillStyle = 'rgba(127,230,200,0.75)';
    const r = Math.max(1, W / 900);
    for (let i = 0; i < lm.length; i++) ctx.fillRect(lm[i].x * W - r / 2, lm[i].y * H - r / 2, r, r);
  }
  if (opts.lines) {
    ctx.lineWidth = Math.max(2, W / 500);
    for (const [k, [a, b]] of Object.entries(LINE_PAIRS)) {
      const p = g(a), q = g(b);
      ctx.strokeStyle = LINE_COLORS[k];
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      for (const e of [p, q]) { ctx.beginPath(); ctx.arc(e.x, e.y, ctx.lineWidth * 1.8, 0, Math.PI * 2); ctx.fillStyle = LINE_COLORS[k]; ctx.fill(); }
    }
  }
  if (!opts.glasses) return;
  const m = state.analysis?.measure || state.live;
  if (!m) return;
  const a = g(468), b = g(473);
  const L = a.x < b.x ? a : b, R = a.x < b.x ? b : a;
  const dist2 = Math.hypot(R.x - L.x, R.y - L.y);
  const dist3 = Math.hypot(R.x - L.x, R.y - L.y, R.z - L.z);
  const ux = (R.x - L.x) / dist2, uy = (R.y - L.y) / dist2;
  const sy = dist3 / m.pdNear;
  // Gốc gọng = hình chiếu của sống mũi (điểm 6) lên đường nối hai đồng tử. Khi quay đầu, sống mũi nhô ra
  // nên lệch khỏi trung điểm hai mắt; mỗi nửa gọng co giãn riêng để đồng tử vẫn đúng vị trí trong tròng.
  const nose = g(6);
  const t = clamp((nose.x - L.x) * ux + (nose.y - L.y) * uy, dist2 * 0.25, dist2 * 0.75);
  const ox = L.x + ux * t, oy = L.y + uy * t;
  const half = m.pdNear / 2;
  const sideT = (len) => ({ a: ux * len / half, b: uy * len / half, c: -uy * sy, d: ux * sy, e: ox, f: oy });
  const T = { L: sideT(t), R: sideT(dist2 - t) };

  const frame = currentFrame(), color = currentColor();
  const size = state.analysis?.size || recommendSize(m);
  const dims = frameDims(frame, size, state.sizeMode);
  const hx = dims.A + dims.B / 2 + dims.endpiece, hy = dims.vOff - dims.H * 0.32 - 0.6;
  const hinges = [[-hx, T.L], [hx, T.R]].map(([x, M]) => ({ x: M.a * x + M.c * hy + M.e, y: M.b * x + M.d * hy + M.f }));
  const e1 = g(127), e2 = g(356);
  const ears = e1.x < e2.x ? [e1, e2] : [e2, e1];
  drawTemples(ctx, hinges, ears, color, sy);
  drawGlasses(ctx, T, frame, color, dims, state.tint);
}

const currentFrame = () => FRAMES.find((f) => f.id === state.frameId);
const currentColor = () => FRAME_COLORS.find((c) => c.id === (state.colorId || currentFrame().defaultColor));

// ---------- Lựa chọn ----------
function selectFrame(id, colorId) {
  state.frameId = id;
  // Giữ màu người dùng tự chọn; nếu chưa chọn, mỗi gọng dùng màu hợp tông da nhất.
  if (colorId === undefined && !state.userColor) colorId = bestColorFor(currentFrame());
  if (colorId !== undefined) state.colorId = colorId;
  const f = currentFrame(), c = currentColor();
  const r = state.results.find((x) => x.frame.id === id);
  const nw = $('#nowWearing');
  nw.hidden = false;
  nw.innerHTML = `<span>Đang thử: <b>${f.name}</b> · ${c.name}${r ? ` · ${r.total}/100` : ''}</span>${state.analysis ? '<button data-fb="like" title="AI sẽ ưu tiên kiểu tương tự">👍 Thích</button><button data-fb="skip" title="Chuyển sang gợi ý khác">👎 Bỏ qua</button>' : ''}`;
  $$('.reco-item').forEach((el) => el.classList.toggle('on', el.dataset.try === id));
  $$('.frame-card').forEach((el) => el.classList.toggle('on', el.dataset.id === id));
  $$('#swatches .sw').forEach((el) => el.classList.toggle('on', el.dataset.id === c.id));
  renderFitCheck();
}

function selectColor(id) {
  state.colorId = id;
  state.userColor = true;
  selectFrame(state.frameId);
  renderCatalog();
}

function startCycle(n = 5) {
  stopCycle();
  const top = state.results.slice(0, n);
  let i = 0;
  const step = () => {
    if (i >= top.length) { stopCycle(); return; }
    selectFrame(top[i].frame.id, bestColorFor(top[i].frame));
    i++;
  };
  step();
  state.cycleTimer = setInterval(step, 2500);
  $('#btnCycle').textContent = 'Dừng';
}

function stopCycle() {
  if (state.cycleTimer) clearInterval(state.cycleTimer);
  state.cycleTimer = null;
  $('#btnCycle').textContent = 'Thử lần lượt Top 5';
}

// ---------- Giao diện ----------
function switchTab(name) {
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  $$('.tab-body').forEach((b) => { b.hidden = b.id !== 'tab-' + name; });
}

const scoreCls = (s) => (s >= 75 ? '' : s >= 60 ? 'mid' : 'low');
const fmt = (v, d = 0) => (v == null || Number.isNaN(v) ? '—' : v.toFixed(d));

const SHAPE_ICONS = {
  oval: '<ellipse cx="35" cy="42" rx="25" ry="38"/>',
  round: '<ellipse cx="35" cy="42" rx="30" ry="34"/>',
  square: '<path d="M8 14Q8 6 18 6H52Q62 6 62 14V58Q62 72 48 78H22Q8 72 8 58Z"/>',
  oblong: '<rect x="12" y="2" width="46" height="80" rx="18"/>',
  heart: '<path d="M6 26Q6 4 35 6Q64 4 64 26Q62 52 35 80Q8 52 6 26Z"/>',
  diamond: '<path d="M35 2Q52 12 64 40Q52 66 35 82Q18 66 6 40Q18 12 35 2Z"/>',
  triangle: '<path d="M20 6Q35 2 50 6Q66 46 62 66Q35 86 8 66Q4 46 20 6Z"/>',
};

function renderResults() {
  const A = state.analysis; if (!A) return;
  const m = A.measure, top = A.shape.probs[0], info = FACE_SHAPES[top.key];
  const tone = undertone();
  const toneColors = FRAME_COLORS.filter((c) => c.tones.includes(tone));
  const eyeInfo = EYE_COLOR_TIPS[A.colors.eye];
  const s = A.size;

  const recs = state.results.slice(0, 5);
  const avoid = state.results.slice(-3).reverse();

  $('#tab-result').innerHTML = `
    ${aiBlockHtml()}
    <div class="shape-hero">
      <svg viewBox="0 0 70 84" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent)">${SHAPE_ICONS[top.key]}</svg>
      <div>
        <div class="conf">Dáng mặt · độ tin cậy ${(top.p * 100).toFixed(0)}%</div>
        <div class="name">${info.name}</div>
        <p>${info.desc}</p>
        <p><b>Mục tiêu khi chọn gọng:</b> ${info.goal}</p>
      </div>
    </div>
    <div class="block bars">
      ${A.shape.probs.map((p) => `<div class="bar-row"><span>${FACE_SHAPES[p.key].name}</span><div class="track"><div class="fill" style="width:${(p.p * 100).toFixed(1)}%"></div></div><span class="v">${(p.p * 100).toFixed(0)}%</span></div>`).join('')}
    </div>

    <div class="block">
      <div class="section-head"><h3>Số đo khuôn mặt</h3><span class="muted">${m.samples} khung hình · thước mống mắt 11,7 mm</span></div>
      <div class="metrics">
        <div class="metric"><div class="k"><i class="legend" style="background:${LINE_COLORS.pd}"></i>PD (nhìn xa)</div><div class="v">${fmt(m.pdFar, 1)} <small>mm</small></div></div>
        <div class="metric"><div class="k"><i class="legend" style="background:${LINE_COLORS.temple}"></i>Ngang thái dương</div><div class="v">${fmt(m.templeMm)} <small>mm</small></div></div>
        <div class="metric"><div class="k"><i class="legend" style="background:${LINE_COLORS.cheek}"></i>Ngang gò má</div><div class="v">${fmt(m.cheekMm)} <small>mm</small></div></div>
        <div class="metric"><div class="k"><i class="legend" style="background:${LINE_COLORS.forehead}"></i>Ngang trán</div><div class="v">${fmt(m.foreheadMm)} <small>mm</small></div></div>
        <div class="metric"><div class="k"><i class="legend" style="background:${LINE_COLORS.jaw}"></i>Ngang hàm</div><div class="v">${fmt(m.jawMm)} <small>mm</small></div></div>
        <div class="metric"><div class="k"><i class="legend" style="background:${LINE_COLORS.length}"></i>Dài : rộng</div><div class="v">${fmt(m.ratioLW, 2)} <small>(TB ≈ 1,20)</small></div></div>
        <div class="metric"><div class="k">Lông mày → đồng tử</div><div class="v">${fmt(m.browAboveMm)} <small>mm</small></div></div>
        <div class="metric"><div class="k">Góc hàm</div><div class="v">${fmt(m.jawAngle)}° <small>${m.jawAngle < 138 ? 'góc cạnh' : m.jawAngle > 144 ? 'bo tròn' : 'trung bình'}</small></div></div>
      </div>
      <div class="size-box">
        <div>
          <h4 style="margin:0">Cỡ gọng gợi ý</h4>
          <div class="size-code">${s.lens}□${s.bridge}–${s.temple}</div>
          <p>Tròng ${s.lens} mm · cầu ${s.bridge} mm · càng ${s.temple} mm · bề ngang gọng ≈ ${s.frameWidth} mm</p>
        </div>
        <div style="text-align:right">
          <div class="score">${s.sizeClass.code}</div>
          <p>${s.sizeClass.label}<br>Cao tròng tối đa ≈ ${s.maxLensHeight} mm</p>
        </div>
      </div>
      <p class="muted" style="margin-top:8px">Số trên càng kính thường in dạng “tròng□cầu–càng”. Sai số ước tính ±3–5% (mống mắt mỗi người lệch ±0,5 mm). Nếu có kính đang vừa, hãy so với số in trên càng.</p>
    </div>

    <div class="block">
      <div class="section-head"><h3>Gợi ý hàng đầu</h3><button class="btn small" data-go="try">Xem tất cả</button></div>
      ${recs.map((r) => recRow(r)).join('')}
    </div>

    <div class="block">
      <h3 style="margin-bottom:8px">Nên tránh</h3>
      <div class="avoid-list">
        ${avoid.map((r) => `<div class="rec"><canvas width="180" height="68" data-thumb="${r.frame.id}"></canvas><div><div class="t">${r.frame.name}</div><ul>${reasonsFor(r, A).slice(0, 2).map((x) => `<li>${x}</li>`).join('') || '<li>Điểm hợp thấp so với các kiểu khác.</li>'}</ul></div><span class="score ${scoreCls(r.total)}">${r.total}</span></div>`).join('')}
        <p>${info.avoid}</p>
      </div>
    </div>

    <div class="block">
      <h3>Màu gọng theo tông da &amp; mắt</h3>
      <div class="tone-row">
        <span class="muted">Tông da: <b style="color:var(--text)">${UNDERTONES[tone].name}</b> · độ sáng ${A.colors.depth}${state.undertoneOverride ? ' (bạn chọn)' : ' (AI ước tính)'}</span>
        <div class="seg" id="toneSeg">
          ${['auto', 'warm', 'neutral', 'cool'].map((t) => `<button data-tone="${t}" class="${(state.undertoneOverride || 'auto') === t ? 'on' : ''}">${{ auto: 'Tự động', warm: 'Ấm', neutral: 'Trung tính', cool: 'Lạnh' }[t]}</button>`).join('')}
        </div>
      </div>
      <p class="muted">${UNDERTONES[tone].tip}</p>
      <div class="palette">${toneColors.map((c) => swatchHtml(c)).join('')}</div>
      <p class="muted" style="margin-top:12px">Màu mắt (ước tính): <b style="color:var(--text)">${eyeInfo.name}</b> — ${eyeInfo.tip}</p>
      <div class="palette">${eyeInfo.colors.map((id) => swatchHtml(FRAME_COLORS.find((c) => c.id === id))).join('')}</div>
      <div class="note">Mẹo kiểm tra tông da: nhìn tĩnh mạch cổ tay dưới ánh sáng tự nhiên — xanh lá → ấm, xanh dương/tím → lạnh, khó phân biệt → trung tính. Ánh sáng đèn vàng/trắng của phòng có thể làm AI đoán lệch; hãy chỉnh tay ở trên nếu cần.</div>
    </div>
    <div class="note">Kết quả mang tính tham khảo thẩm mỹ, không thay thế việc đo khám tại cửa hàng kính/bác sĩ nhãn khoa (đặc biệt PD và tròng đa tròng).</div>
  `;
  $$('#tab-result canvas[data-thumb]').forEach((cv) => {
    const f = FRAMES.find((x) => x.id === cv.dataset.thumb);
    drawThumb(cv, f, FRAME_COLORS.find((c) => c.id === bestColorFor(f)));
  });
}

function recRow(r) {
  const why = reasonsFor(r, state.analysis).slice(0, 3);
  return `<div class="rec">
    <canvas width="180" height="68" data-thumb="${r.frame.id}"></canvas>
    <div><div class="t">${r.frame.name} <span class="muted">· ${r.dims.A}□${r.dims.B}</span></div>
      <ul>${(why.length ? why : [r.frame.desc]).map((x) => `<li>${x}</li>`).join('')}</ul>
      <button class="btn small" data-try="${r.frame.id}" style="margin-top:6px">Thử ngay</button></div>
    <span class="score ${scoreCls(r.total)}">${r.total}</span>
  </div>`;
}

function swatchHtml(c) {
  const bg = c.hex === 'tortoise' ? '' : `background:${c.hex}`;
  return `<button class="sw" data-color="${c.id}" title="${c.name}"><i class="${c.hex === 'tortoise' ? 'tortoise-bg' : ''}" style="${bg}"></i>${c.name}</button>`;
}

function renderCatalog() {
  const scores = Object.fromEntries(state.results.map((r) => [r.frame.id, r.total]));
  const flt = state.catalogFilter;
  const order = (state.results.length ? state.results.map((r) => r.frame) : FRAMES)
    .filter((f) => flt === 'all' || f.material === flt || f.tags.includes(flt));
  $('#catalogFilter').innerHTML = [['all', `Tất cả (${FRAMES.length})`], ...Object.entries(MATERIALS), ...Object.entries(STYLE_TAGS)]
    .map(([k, v]) => `<button class="chip-btn ${flt === k ? 'on' : ''}" data-filter="${k}">${v}</button>`).join('');
  $('#catalog').innerHTML = order.map((f) => `
    <button class="frame-card ${f.id === state.frameId ? 'on' : ''}" data-id="${f.id}" title="${f.desc}">
      <canvas width="280" height="92"></canvas>
      <div class="n">${f.name}</div>
      ${scores[f.id] != null ? `<span class="score ${scoreCls(scores[f.id])}">${scores[f.id]}</span>` : ''}
    </button>`).join('');
  $('#catalogHint').textContent = state.results.length ? 'Sắp xếp theo điểm hợp với bạn' : 'Điểm hiện sau khi phân tích';
  $$('.frame-card').forEach((el) => {
    const f = FRAMES.find((x) => x.id === el.dataset.id);
    const c = state.userColor ? currentColor() : FRAME_COLORS.find((x) => x.id === bestColorFor(f));
    drawThumb(el.querySelector('canvas'), f, c);
  });
}

function renderSwatches() {
  const tone = state.analysis ? undertone() : null;
  $('#swatches').innerHTML = FRAME_COLORS.map((c) => {
    const bg = c.hex === 'tortoise' ? '' : `background:${c.hex}`;
    return `<button class="sw ${c.id === currentColor().id ? 'on' : ''}" data-id="${c.id}" title="${c.name}">
      <i class="${c.hex === 'tortoise' ? 'tortoise-bg' : ''}" style="${bg}"></i>${c.name}
      ${tone && c.tones.includes(tone) ? '<span class="match" title="Hợp tông da"></span>' : ''}</button>`;
  }).join('');
  $('#colorHint').textContent = tone ? `Chấm xanh = hợp tông da ${UNDERTONES[tone].name.toLowerCase()}` : '';
}

function renderFitCheck() {
  const box = $('#fitCheck');
  const A = state.analysis;
  if (!A) return;
  const f = currentFrame();
  const dims = frameDims(f, A.size, state.sizeMode);
  const checks = fitChecks(A.measure, A.size, dims);
  const r = state.results.find((x) => x.frame.id === f.id);
  box.innerHTML = `
    <div class="section-head"><h3>Độ vừa vặn: ${f.name} ${dims.A}□${dims.B}–${A.size.temple}</h3>${r ? `<span class="score ${scoreCls(r.total)}">${r.total}/100</span>` : ''}</div>
    <p class="muted" style="margin:0">${f.desc} Bề ngang gọng ≈ ${dims.total} mm, cao tròng ${dims.H} mm.</p>
    <div class="checks">${checks.map((c) => `
      <div class="check ${c.ok === false ? 'bad' : c.ok === null ? 'na' : ''}">
        <span class="ic">${c.ok === false ? '!' : c.ok === null ? 'i' : '✓'}</span>
        <div><b>${c.label}</b>${c.text}</div>
      </div>`).join('')}</div>`;
}

function renderSnaps() {
  $('#snapCount').textContent = state.snapshots.length;
  $('#snaps').innerHTML = state.snapshots.length ? state.snapshots.map((s, i) => `
    <div class="snap">
      <img src="${s.img}" alt="${s.frame}">
      <div class="meta"><b>${s.frame}</b>${s.color}${s.score != null ? ` · <b style="display:inline">${s.score}</b>/100` : ''}
        <div class="acts"><a class="btn small" href="${s.img}" download="kinhfit-${i + 1}.jpg">Lưu ảnh</a><button class="btn small" data-del="${i}">Xoá</button></div>
      </div>
    </div>`).join('') : '<p class="muted">Chưa có ảnh nào.</p>';
}

function snapshot() {
  if (!state.lm) { toast('Chưa thấy khuôn mặt.'); return; }
  const W = state.W, H = state.H;
  const layer = document.createElement('canvas'); layer.width = W; layer.height = H;
  drawScene(layer.getContext('2d'), { glasses: state.showGlasses });
  const scale = Math.min(1, 720 / W);
  const out = document.createElement('canvas'); out.width = Math.round(W * scale); out.height = Math.round(H * scale);
  const x = out.getContext('2d');
  if (state.mode === 'camera') { x.translate(out.width, 0); x.scale(-1, 1); }
  x.drawImage(state.mode === 'camera' ? video : photo, 0, 0, out.width, out.height);
  x.drawImage(layer, 0, 0, out.width, out.height);
  const r = state.results.find((q) => q.frame.id === state.frameId);
  state.snapshots.unshift({ img: out.toDataURL('image/jpeg', 0.88), frame: currentFrame().name, color: currentColor().name, score: r?.total });
  renderSnaps();
  const btn = $('#btnSnap'); btn.textContent = 'Đã lưu ✓';
  setTimeout(() => { btn.textContent = 'Chụp để so sánh'; }, 1000);
}

function renderLearn() {
  const shapeRows = Object.entries(FACE_SHAPES).map(([k, s]) => {
    const best = FRAMES.filter((f) => f.compat[k] >= 85).map((f) => f.name).join(', ');
    return `<tr><td><b>${s.name}</b><br><span class="muted">${s.desc}</span></td><td>${best}</td><td>${s.avoid}</td></tr>`;
  }).join('');
  $('#tab-learn').innerHTML = `<div class="learn">
    <h3>Cách ứng dụng hoạt động</h3>
    <ol>
      <li><b>Nhận diện 478 điểm mốc</b> khuôn mặt + mống mắt bằng mô hình MediaPipe Face Landmarker của Google, chạy trực tiếp trong trình duyệt (WebAssembly/GPU) — ảnh không rời khỏi máy.</li>
      <li><b>Quy đổi pixel → mm</b> bằng đường kính mống mắt người ≈ 11,7 ± 0,5 mm (hầu như không đổi giữa người với người). Từ đó tính PD, bề ngang thái dương, gò má, trán, hàm và khoảng cách tới camera.</li>
      <li><b>Lấy trung vị ~36 khung hình</b> khi đầu nhìn thẳng (lệch &lt; 10°) để loại nhiễu.</li>
      <li><b>Phân loại dáng mặt</b> bằng 5 đặc trưng: tỷ lệ dài/rộng, hàm/gò má, trán/gò má, cằm/hàm, góc hàm — so với nguyên mẫu 7 dáng mặt, ra xác suất.</li>
      <li><b>Chấm điểm ${FRAMES.length} kiểu gọng</b> = 65% độ hợp dáng mặt (tổng hợp từ các hướng dẫn bên dưới) + 20% độ vừa vặn hình học (bề ngang, tâm đồng tử, lông mày, gò má) + 15% đặc điểm riêng (trán/hàm, độ dài mặt, góc hàm).</li>
      <li><b>Cá nhân hoá:</b> cộng/trừ điểm theo phong cách, chất liệu, nhu cầu bạn chọn và theo các lần bạn bấm Thích / Bỏ qua — AI học gu của bạn trong phiên.</li>
      <li><b>Tông da</b> ước tính từ màu da má/trán trong không gian CIELAB (góc màu h° và chỉ số ITA°); <b>màu mắt</b> từ vành mống mắt.</li>
    </ol>
    <h3>Gọng hợp từng dáng mặt</h3>
    <table><thead><tr><th>Dáng mặt</th><th>Nên chọn</th><th>Nên tránh</th></tr></thead><tbody>${shapeRows}</tbody></table>
    <h3>Đọc &amp; chọn cỡ gọng</h3>
    <ul>
      <li>Ba số trên càng kính, ví dụ <b>52□18–140</b>: rộng tròng 52 mm, cầu mũi 18 mm, càng 140 mm. Phổ biến: tròng ${SIZE_GUIDE.lensWidth[0]}–${SIZE_GUIDE.lensWidth[1]} mm, cầu ${SIZE_GUIDE.bridge[0]}–${SIZE_GUIDE.bridge[1]} mm, càng ${SIZE_GUIDE.temple[0]}–${SIZE_GUIDE.temple[1]} mm.</li>
      <li>Bề ngang thái dương &lt; 130 mm: mặt nhỏ · 130–145 mm: trung bình · &gt; 145 mm: lớn. Gọng nên rộng xấp xỉ mặt, không thừa quá một ngón tay mỗi bên.</li>
      <li>Cầu mũi nhỏ cho sống mũi hẹp, cầu lớn cho sống mũi rộng. Mũi thấp (thường gặp ở người châu Á) nên ưu tiên gọng có đệm mũi chỉnh được (Asian fit) để kính không trượt và không chạm má.</li>
      <li>Càng dài hơn cho gọng rộng (≥145 mm), gọng nhỏ dùng 135–140 mm.</li>
      <li>Viền trên nên chạy theo đường lông mày; đáy tròng không chạm gò má khi cười; theo chiều ngang, đồng tử nằm gần tâm tròng (hơi lệch vào trong là bình thường); theo chiều dọc, đồng tử nằm ở nửa trên tròng (~40% chiều cao tính từ viền trên).</li>
      <li>Tròng đa tròng (progressive) cần chiều cao tròng ≥ 30 mm.</li>
    </ul>
    <h3>Màu gọng</h3>
    <ul>
      <li><b>Tông da quan trọng hơn màu tóc/mắt.</b> Tông ấm: đồi mồi, mật ong, nâu, vàng kim, ô liu. Tông lạnh: bạc, đen, xanh navy, tím, hồng pastel, xám. Trung tính: gần như mọi màu.</li>
      <li>Tránh màu lạnh gắt (bạc trắng, xám băng) trên da ấm vì tạo tương phản thô.</li>
      <li>Mắt xanh lá hợp nâu đất, vàng kim, tím/hồng; mắt xanh dương hợp màu ấm bổ sung như đồi mồi, cam đồng.</li>
    </ul>
    <h3>Mẹo để đo chính xác</h3>
    <ul>
      <li>Ngồi 40–60 cm, camera ngang tầm mắt, nhìn thẳng, ánh sáng đều phía trước mặt.</li>
      <li>Tháo kính đang đeo, vén tóc khỏi trán và hai bên thái dương.</li>
      <li>Quét lại 2–3 lần; kết quả ổn định là đáng tin.</li>
    </ul>
    <h3>Nguồn tham khảo</h3>
    <ol>${SOURCES.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></li>`).join('')}</ol>
  </div>`;
}

// ---------- Sự kiện ----------
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, [data-action]');
  if (!t) return;
  if (t.dataset.fb) feedback(t.dataset.fb === 'like');
  else if (t.dataset.aiPick) aiPick(true);
  else if (t.dataset.showcase) startCycle(3);
  else if (t.dataset.prefStyle) { const s = state.prefs.styles, k = t.dataset.prefStyle; s.has(k) ? s.delete(k) : s.add(k); aiPick(false); }
  else if (t.dataset.prefMat) { state.prefs.material = t.dataset.prefMat; aiPick(false); }
  else if (t.dataset.prefNeed) { state.prefs.need = t.dataset.prefNeed; aiPick(false); }
  else if (t.dataset.filter) { state.catalogFilter = t.dataset.filter; renderCatalog(); }
  else if (t.dataset.action === 'camera') startCamera();
  else if (t.dataset.tab) switchTab(t.dataset.tab);
  else if (t.dataset.go) switchTab(t.dataset.go);
  else if (t.dataset.try) { stopCycle(); selectFrame(t.dataset.try, bestColorFor(FRAMES.find((f) => f.id === t.dataset.try))); renderSwatches(); }
  else if (t.classList.contains('frame-card')) { stopCycle(); selectFrame(t.dataset.id); }
  else if (t.closest('#swatches')) { stopCycle(); selectColor(t.dataset.id); renderSwatches(); }
  else if (t.dataset.color) { stopCycle(); selectColor(t.dataset.color); renderSwatches(); }
  else if (t.dataset.size) {
    state.sizeMode = t.dataset.size;
    $$('#sizeSeg button').forEach((b) => b.classList.toggle('on', b === t));
    renderFitCheck();
  } else if (t.dataset.tint) {
    setTint(t.dataset.tint);
  } else if (t.dataset.tone) {
    state.undertoneOverride = t.dataset.tone === 'auto' ? null : t.dataset.tone;
    renderResults(); renderSwatches();
  } else if (t.dataset.del) {
    state.snapshots.splice(Number(t.dataset.del), 1); renderSnaps();
  }
});

$('#btnScan').addEventListener('click', () => {
  if (state.mode === 'camera') startScan();
  else if (state.mode === 'photo') toast('Với ảnh tải lên, kết quả đã được phân tích ngay khi tải.');
});
$('#btnSnap').addEventListener('click', snapshot);
$('#btnCycle').addEventListener('click', () => (state.cycleTimer ? stopCycle() : startCycle()));
$('#btnClearSnaps').addEventListener('click', () => { state.snapshots = []; renderSnaps(); });
$('#tGlasses').addEventListener('change', (e) => { state.showGlasses = e.target.checked; });
$('#tMesh').addEventListener('change', (e) => { state.showMesh = e.target.checked; });
$('#tLines').addEventListener('change', (e) => { state.showLines = e.target.checked; if (e.target.checked && state.analysis) switchTab('result'); });
$$('.file-input').forEach((inp) => inp.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) loadPhoto(URL.createObjectURL(file)).catch((err) => { console.error(err); toast('Không đọc được ảnh: ' + err.message); });
  e.target.value = '';
}));

// Dùng cho kiểm thử: nạp ảnh từ URL (máy chủ ảnh phải cho phép CORS).
window.kinhfit = { loadPhoto, state };

renderCatalog();
renderSwatches();
renderSnaps();
renderLearn();
requestAnimationFrame(loop);
initModel();
