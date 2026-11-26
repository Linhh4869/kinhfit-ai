// Cơ sở tri thức tổng hợp từ các hướng dẫn chọn kính (xem SOURCES ở cuối file).

export const FACE_SHAPES = {
  oval: {
    name: 'Trái xoan (Oval)',
    desc: 'Mặt dài hơn rộng, trán nhỉnh hơn cằm một chút, đường hàm bo mềm — tỷ lệ cân đối nhất.',
    goal: 'Giữ sự cân đối: gọng rộng bằng hoặc hơi rộng hơn phần rộng nhất của mặt.',
    avoid: 'Gọng quá to (oversized) phá tỷ lệ cân đối; gọng quá hẹp làm mặt trông dài thêm.',
  },
  round: {
    name: 'Tròn (Round)',
    desc: 'Chiều dài và chiều rộng gần bằng nhau, má đầy, đường hàm và cằm bo tròn.',
    goal: 'Thêm góc cạnh và cấu trúc để mặt trông dài, thon hơn; đáy gọng nằm trên gò má.',
    avoid: 'Gọng tròn nhỏ, gọng bo tròn hoàn toàn hoặc quá hẹp làm mặt tròn hơn.',
  },
  square: {
    name: 'Vuông (Square)',
    desc: 'Trán, gò má và hàm rộng gần bằng nhau, hàm góc cạnh, cằm rộng.',
    goal: 'Làm mềm đường hàm và các góc bằng gọng tròn/oval, có thể mảnh và rộng hơn gò má.',
    avoid: 'Gọng vuông, nhiều góc cạnh hoặc nặng phần dưới làm hàm thô hơn.',
  },
  oblong: {
    name: 'Dài (Oblong / Chữ nhật)',
    desc: 'Mặt dài rõ rệt so với chiều rộng, trán – gò má – hàm khá thẳng hàng.',
    goal: 'Làm mặt trông ngắn và rộng ra: chọn gọng có chiều cao tròng lớn (sâu), bản to.',
    avoid: 'Gọng nhỏ, hẹp, tròng thấp (dẹt) kéo dài khuôn mặt.',
  },
  heart: {
    name: 'Trái tim (Heart)',
    desc: 'Trán và gò má rộng, thon dần xuống cằm nhỏ, nhọn.',
    goal: 'Cân bằng trán rộng với cằm nhỏ: gọng nhẹ phần trên, nhấn phần dưới (bottom-heavy).',
    avoid: 'Gọng nặng/đậm phần trên (browline, cat-eye bản to), trang trí phía trên.',
  },
  diamond: {
    name: 'Kim cương (Diamond)',
    desc: 'Gò má là phần rộng nhất; trán và cằm hẹp, cằm thường nhọn.',
    goal: 'Tôn gò má, làm mềm góc và tạo thêm bề rộng ở vùng trán/lông mày.',
    avoid: 'Gọng hẹp hơn gò má hoặc quá góc cạnh hẹp ngang tầm mắt.',
  },
  triangle: {
    name: 'Tam giác (Triangle / Pear)',
    desc: 'Hàm rộng hơn trán, phần dưới mặt nổi bật hơn phần trên.',
    goal: 'Thêm bề rộng và điểm nhấn ở phần trên (gọng đậm phía trên) để cân bằng hàm.',
    avoid: 'Gọng nhỏ, hẹp, hoặc nặng phần dưới.',
  },
};

export const SHAPE_KEYS = Object.keys(FACE_SHAPES);

// aspect = chiều cao tròng / chiều rộng tròng; widthScale nhân với kích thước tròng gợi ý.
// rim: full (nhựa acetate), metal, rimless, semi (nửa viền), browline.
// traits.topHeavy: >0 nặng phía trên, <0 nặng phía dưới. traits.angular: 0 = mềm, 1 = góc cạnh.
export const FRAMES = [
  {
    id: 'rectangle', name: 'Chữ nhật', en: 'Rectangle', shape: 'rectangle', aspect: 0.62, widthScale: 1,
    rim: 'full', thick: 2.4, bridge: 'saddle', defaultColor: 'black',
    desc: 'Gọng ngang, góc bo nhẹ. Tạo cấu trúc, làm mặt trông dài và thon hơn.',
    traits: { angular: 0.9, topHeavy: 0 },
    compat: { oval: 85, round: 95, square: 35, oblong: 45, heart: 65, diamond: 60, triangle: 55 },
  },
  {
    id: 'square', name: 'Vuông', en: 'Square', shape: 'square', aspect: 0.84, widthScale: 1,
    rim: 'full', thick: 2.6, bridge: 'saddle', defaultColor: 'tortoise',
    desc: 'Gọng vuông bản dày, cá tính. Cân bằng má đầy; tròng sâu hợp mặt dài.',
    traits: { angular: 1, topHeavy: 0 },
    compat: { oval: 85, round: 90, square: 30, oblong: 72, heart: 58, diamond: 55, triangle: 50 },
  },
  {
    id: 'wayfarer', name: 'Wayfarer', en: 'Wayfarer', shape: 'wayfarer', aspect: 0.76, widthScale: 1,
    rim: 'full', thick: 3.2, bridge: 'saddle', defaultColor: 'black',
    desc: 'Hình thang, phía trên rộng hơn, viền dày. Kinh điển, dễ đeo.',
    traits: { angular: 0.8, topHeavy: 0.4 },
    compat: { oval: 90, round: 85, square: 55, oblong: 68, heart: 55, diamond: 70, triangle: 75 },
  },
  {
    id: 'round', name: 'Tròn', en: 'Round', shape: 'round', aspect: 0.94, widthScale: 0.96,
    rim: 'full', thick: 2.2, bridge: 'keyhole', defaultColor: 'gold',
    desc: 'Tròng tròn cổ điển. Làm mềm hàm vuông và góc cạnh.',
    traits: { angular: 0, topHeavy: 0 },
    compat: { oval: 80, round: 28, square: 95, oblong: 80, heart: 72, diamond: 70, triangle: 62 },
  },
  {
    id: 'oval', name: 'Oval', en: 'Oval', shape: 'oval', aspect: 0.72, widthScale: 1,
    rim: 'full', thick: 2.2, bridge: 'saddle', defaultColor: 'brown',
    desc: 'Đường cong mềm, thanh lịch. Hợp mặt góc cạnh và mặt kim cương.',
    traits: { angular: 0.1, topHeavy: 0 },
    compat: { oval: 85, round: 45, square: 92, oblong: 72, heart: 75, diamond: 90, triangle: 68 },
  },
  {
    id: 'cateye', name: 'Mắt mèo', en: 'Cat-eye', shape: 'cateye', aspect: 0.7, widthScale: 1.02,
    rim: 'full', thick: 2.8, bridge: 'saddle', defaultColor: 'burgundy',
    desc: 'Góc ngoài phía trên vểnh lên — nâng gò má, thêm bề rộng phần trên.',
    traits: { angular: 0.5, topHeavy: 0.9 },
    compat: { oval: 85, round: 85, square: 70, oblong: 58, heart: 50, diamond: 95, triangle: 96 },
  },
  {
    id: 'aviator', name: 'Phi công', en: 'Aviator', shape: 'aviator', aspect: 0.86, widthScale: 1.04,
    rim: 'metal', thick: 1.0, bridge: 'double', defaultColor: 'gold',
    desc: 'Giọt nước, cầu đôi kim loại. Phần dưới đầy giúp cân bằng trán rộng.',
    traits: { angular: 0.2, topHeavy: -0.6 },
    compat: { oval: 85, round: 65, square: 82, oblong: 76, heart: 92, diamond: 70, triangle: 58 },
  },
  {
    id: 'browline', name: 'Browline / Clubmaster', en: 'Browline', shape: 'browline', aspect: 0.72, widthScale: 1,
    rim: 'browline', thick: 4.2, bridge: 'metal', defaultColor: 'tortoise',
    desc: 'Viền trên đậm như lông mày, viền dưới kim loại mảnh. Nhấn phần trên mặt.',
    traits: { angular: 0.6, topHeavy: 1 },
    compat: { oval: 85, round: 78, square: 55, oblong: 64, heart: 42, diamond: 90, triangle: 96 },
  },
  {
    id: 'geometric', name: 'Lục giác / Hình học', en: 'Geometric', shape: 'hexagon', aspect: 0.84, widthScale: 1,
    rim: 'metal', thick: 1.1, bridge: 'metal', defaultColor: 'silver',
    desc: 'Lục giác/đa giác kim loại. Thời trang, thêm góc cạnh cho mặt tròn.',
    traits: { angular: 1, topHeavy: 0 },
    compat: { oval: 80, round: 90, square: 48, oblong: 62, heart: 66, diamond: 62, triangle: 60 },
  },
  {
    id: 'panto', name: 'Panto (P3)', en: 'Panto', shape: 'panto', aspect: 0.88, widthScale: 0.98,
    rim: 'full', thick: 2.4, bridge: 'keyhole', defaultColor: 'tortoise',
    desc: 'Tròn với đỉnh hơi phẳng, cầu keyhole. Mềm mại nhưng vẫn có cấu trúc.',
    traits: { angular: 0.25, topHeavy: 0 },
    compat: { oval: 82, round: 55, square: 86, oblong: 72, heart: 76, diamond: 76, triangle: 64 },
  },
  {
    id: 'dframe', name: 'D-frame', en: 'D-frame', shape: 'dframe', aspect: 0.86, widthScale: 1,
    rim: 'full', thick: 2.6, bridge: 'saddle', defaultColor: 'black',
    desc: 'Đỉnh phẳng, đáy bo tròn sâu. Tròng sâu làm mặt dài trông ngắn lại.',
    traits: { angular: 0.4, topHeavy: -0.4 },
    compat: { oval: 80, round: 62, square: 70, oblong: 86, heart: 88, diamond: 66, triangle: 50 },
  },
  {
    id: 'oversized', name: 'Bản to (Oversized)', en: 'Oversized', shape: 'oversized', aspect: 0.92, widthScale: 1.12,
    rim: 'full', thick: 3.0, bridge: 'saddle', defaultColor: 'black',
    desc: 'Tròng lớn, bản dày. Lấp khoảng trống dọc của mặt dài, cá tính.',
    traits: { angular: 0.7, topHeavy: 0 },
    compat: { oval: 50, round: 60, square: 66, oblong: 92, heart: 52, diamond: 58, triangle: 62 },
  },
  {
    id: 'rimless', name: 'Không viền (Rimless)', en: 'Rimless', shape: 'rimless', aspect: 0.66, widthScale: 1,
    rim: 'rimless', thick: 0.5, bridge: 'metal', defaultColor: 'silver',
    desc: 'Chỉ có tròng và cầu kim loại. Nhẹ, kín đáo — hợp mặt trái tim, kim cương.',
    traits: { angular: 0.4, topHeavy: -0.2 },
    compat: { oval: 85, round: 62, square: 72, oblong: 62, heart: 95, diamond: 90, triangle: 70 },
  },
  {
    id: 'semirimless', name: 'Nửa viền (Half-rim)', en: 'Semi-rimless', shape: 'rectangle', aspect: 0.64, widthScale: 1,
    rim: 'semi', thick: 2.8, bridge: 'metal', defaultColor: 'gunmetal',
    desc: 'Viền đậm phía trên, cước dưới. Nhấn đường lông mày, gọn gàng công sở.',
    traits: { angular: 0.6, topHeavy: 0.7 },
    compat: { oval: 85, round: 75, square: 76, oblong: 64, heart: 48, diamond: 86, triangle: 94 },
  },
];

// tones: tông da hợp. kind: acetate | metal.
export const FRAME_COLORS = [
  { id: 'black', name: 'Đen', hex: '#141416', tones: ['cool', 'neutral'], kind: 'acetate' },
  { id: 'tortoise', name: 'Đồi mồi', hex: 'tortoise', tones: ['warm', 'neutral'], kind: 'acetate' },
  { id: 'honey', name: 'Mật ong', hex: '#b9803a', tones: ['warm'], kind: 'acetate' },
  { id: 'brown', name: 'Nâu', hex: '#5b3a24', tones: ['warm', 'neutral'], kind: 'acetate' },
  { id: 'olive', name: 'Xanh ô liu', hex: '#56613b', tones: ['warm'], kind: 'acetate' },
  { id: 'burgundy', name: 'Đỏ rượu', hex: '#6e1f2c', tones: ['warm', 'neutral'], kind: 'acetate' },
  { id: 'red', name: 'Đỏ', hex: '#b3282d', tones: ['warm'], kind: 'acetate' },
  { id: 'navy', name: 'Xanh navy', hex: '#1f3a68', tones: ['cool', 'neutral'], kind: 'acetate' },
  { id: 'grey', name: 'Xám', hex: '#6a6e76', tones: ['cool'], kind: 'acetate' },
  { id: 'purple', name: 'Tím', hex: '#5d3b7a', tones: ['cool'], kind: 'acetate' },
  { id: 'pink', name: 'Hồng pastel', hex: '#e3a9bb', tones: ['cool'], kind: 'acetate' },
  { id: 'crystal', name: 'Trong suốt', hex: 'rgba(225,232,240,0.55)', tones: ['cool', 'neutral'], kind: 'acetate' },
  { id: 'gold', name: 'Vàng kim', hex: '#c9a24a', tones: ['warm', 'neutral'], kind: 'metal' },
  { id: 'rosegold', name: 'Vàng hồng', hex: '#c58f7b', tones: ['warm', 'neutral'], kind: 'metal' },
  { id: 'silver', name: 'Bạc', hex: '#b8bec7', tones: ['cool'], kind: 'metal' },
  { id: 'gunmetal', name: 'Xám kim loại', hex: '#4a4f57', tones: ['cool', 'neutral'], kind: 'metal' },
];

export const UNDERTONES = {
  warm: {
    name: 'Ấm (vàng/đào)',
    tip: 'Hợp màu đất: đồi mồi, mật ong, nâu, vàng kim, ô liu, đỏ rượu. Hạn chế bạc lạnh, xám băng, đen quá gắt.',
  },
  cool: {
    name: 'Lạnh (hồng/xanh)',
    tip: 'Hợp bạc, xám kim loại, đen, navy, tím, hồng pastel, trong suốt, đồi mồi tông xám. Hạn chế vàng/cam quá nóng.',
  },
  neutral: {
    name: 'Trung tính',
    tip: 'Đeo được hầu hết các màu — chọn theo cá tính; đen, đồi mồi, vàng hồng và trong suốt đều an toàn.',
  },
};

export const EYE_COLOR_TIPS = {
  dark: { name: 'Nâu đậm / đen', tip: 'Hầu hết màu đều hợp; xanh navy, đỏ rượu, đồi mồi làm mắt nổi bật.', colors: ['navy', 'burgundy', 'tortoise', 'gold'] },
  brown: { name: 'Nâu', tip: 'Xanh dương, xanh lá, đồi mồi và vàng kim làm nổi sắc nâu.', colors: ['navy', 'olive', 'tortoise', 'gold'] },
  hazel: { name: 'Nâu hạt dẻ / xanh lá', tip: 'Nâu đất, vàng kim, và tím/hồng tạo tương phản đẹp.', colors: ['brown', 'gold', 'purple', 'pink'] },
  light: { name: 'Xanh / xám', tip: 'Đồi mồi, mật ong, vàng hồng (màu bổ sung ấm) làm mắt sáng hơn.', colors: ['tortoise', 'honey', 'rosegold', 'navy'] },
};

export const SIZE_GUIDE = {
  lensWidth: [40, 62],
  bridge: [14, 24],
  temple: [120, 150],
  progressiveMinHeight: 30,
  faceClasses: [
    { max: 130, label: 'Nhỏ (Narrow)', code: 'S' },
    { max: 145, label: 'Trung bình (Medium)', code: 'M' },
    { max: 999, label: 'Lớn (Wide)', code: 'L' },
  ],
};

export const SOURCES = [
  { title: 'Warby Parker — Glasses for different face shapes', url: 'https://www.warbyparker.com/learn/glasses-for-different-face-shapes' },
  { title: 'Warby Parker — Eyeglasses measurements', url: 'https://www.warbyparker.com/learn/eyeglasses-measurements' },
  { title: 'Warby Parker — Frame color guide', url: 'https://www.warbyparker.com/learn/frame-color-guide-eyeglasses-find-your-best-shade' },
  { title: 'EyeBuyDirect — Frames and face shapes', url: 'https://www.eyebuydirect.com/guides/frames-and-face-shapes' },
  { title: 'EyeBuyDirect — Frame measurements', url: 'https://www.eyebuydirect.com/guides/frame-measurements' },
  { title: 'EyeBuyDirect — How to select frame color', url: 'https://www.eyebuydirect.com/guides/how-to-select-frame-color' },
  { title: 'Zenni Optical — Face shape guide', url: 'https://www.zennioptical.com/help/frames-fitting/face-shape-guide' },
  { title: 'Zenni Optical — How to measure eyeglass frame size', url: 'https://www.zennioptical.com/measure-eyeglass-frame-size-how-to' },
  { title: 'Zenni Optical — Selecting the right frame color', url: 'https://www.zennioptical.com/blog/selecting-the-right-frame-color/' },
  { title: 'All About Vision — Best frames for face shape', url: 'https://www.allaboutvision.com/en-gb/eyeglasses/best-frames-for-face-shape/' },
  { title: 'All About Vision — Glasses frame size', url: 'https://www.allaboutvision.com/eyewear/eyeglasses/styles/glasses-frame-size/' },
  { title: 'WebMD — How to pick the right glasses for your face shape', url: 'https://www.webmd.com/eye-health/cm/how-to-pick-the-right-glasses-for-your-face-shape' },
  { title: '1-800 Contacts — Best frames for my face shape', url: 'https://www.1800contacts.com/eyesociety/what-are-the-best-frames-for-my-face-shape' },
  { title: 'U.S. Dept. of Veterans Affairs — How to select a frame for eyeglasses (PDF)', url: 'https://www.va.gov/files/2026-01/How_to_Select_a_Frame_for_Eyeglasses.pdf' },
  { title: 'Jimmy Fairly — Frame color for your skin tone', url: 'https://www.jimmyfairly.com/blogs/journal/how-to-choose-the-right-frame-color-for-your-skin-tone' },
  { title: 'Foster Grant — Best frame color for skin tone', url: 'https://www.fostergrant.com/blogs/helpful-resources/best-frame-color-for-skin-tone' },
  { title: 'Google Research — MediaPipe Iris: iris ≈ 11.7 ± 0.5 mm làm thước đo', url: 'https://research.google/blog/mediapipe-iris-real-time-iris-tracking-depth-estimation/' },
  { title: 'Wikipedia — Pupillary distance', url: 'https://en.wikipedia.org/wiki/Pupillary_distance' },
];
