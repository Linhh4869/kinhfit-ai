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
  {
    id: 'softsquare', name: 'Vuông bo tròn', en: 'Soft square', shape: 'softsquare', aspect: 0.8, widthScale: 1,
    rim: 'full', thick: 2.6, bridge: 'saddle', defaultColor: 'tortoise',
    desc: 'Vuông nhưng bo góc lớn — vừa có cấu trúc vừa mềm mại, rất dễ đeo.',
    traits: { angular: 0.55, topHeavy: 0 },
    compat: { oval: 88, round: 80, square: 58, oblong: 76, heart: 66, diamond: 66, triangle: 62 },
  },
  {
    id: 'octagon', name: 'Bát giác', en: 'Octagon', shape: 'octagon', aspect: 0.86, widthScale: 0.98,
    rim: 'metal', thick: 1.1, bridge: 'metal', defaultColor: 'gold',
    desc: 'Tám cạnh kim loại mảnh — hiện đại, thêm góc cạnh nhẹ nhàng cho mặt tròn.',
    traits: { angular: 0.8, topHeavy: 0 },
    compat: { oval: 85, round: 86, square: 60, oblong: 66, heart: 70, diamond: 74, triangle: 64 },
  },
  {
    id: 'butterfly', name: 'Cánh bướm', en: 'Butterfly', shape: 'butterfly', aspect: 0.84, widthScale: 1.08,
    rim: 'full', thick: 3.0, bridge: 'saddle', defaultColor: 'burgundy',
    desc: 'Tròng to, góc ngoài xoè rộng lên trên — nữ tính, nổi bật, mở rộng phần trên mặt.',
    traits: { angular: 0.4, topHeavy: 0.8 },
    compat: { oval: 80, round: 76, square: 76, oblong: 80, heart: 48, diamond: 86, triangle: 92 },
  },
  {
    id: 'clubround', name: 'Clubround', en: 'Clubround', shape: 'round', aspect: 0.9, widthScale: 0.96,
    rim: 'browline', thick: 4.0, bridge: 'metal', defaultColor: 'black',
    desc: 'Tròng tròn với viền mày đậm — kết hợp nét cổ điển của browline và sự mềm của gọng tròn.',
    traits: { angular: 0.2, topHeavy: 0.9 },
    compat: { oval: 85, round: 58, square: 86, oblong: 70, heart: 45, diamond: 86, triangle: 92 },
  },
  {
    id: 'roundwire', name: 'Tròn kim loại mảnh', en: 'Round wire', shape: 'round', aspect: 0.96, widthScale: 0.9,
    rim: 'metal', thick: 0.9, bridge: 'metal', defaultColor: 'gold',
    desc: 'Tròng tròn nhỏ, viền kim loại siêu mảnh phong cách vintage — nhẹ và tinh tế.',
    traits: { angular: 0, topHeavy: 0 },
    compat: { oval: 80, round: 25, square: 90, oblong: 68, heart: 80, diamond: 74, triangle: 55 },
  },
  {
    id: 'navigator', name: 'Navigator', en: 'Navigator', shape: 'navigator', aspect: 0.84, widthScale: 1.04,
    rim: 'metal', thick: 1.1, bridge: 'double', defaultColor: 'gunmetal',
    desc: 'Phi công dáng vuông, cầu đôi — mạnh mẽ hơn aviator, thêm góc cạnh.',
    traits: { angular: 0.6, topHeavy: -0.3 },
    compat: { oval: 86, round: 80, square: 64, oblong: 78, heart: 80, diamond: 68, triangle: 60 },
  },
  {
    id: 'metalrect', name: 'Chữ nhật titan', en: 'Titanium rectangle', shape: 'rectangle', aspect: 0.6, widthScale: 1,
    rim: 'metal', thick: 1.0, bridge: 'metal', defaultColor: 'silver',
    desc: 'Chữ nhật viền titan mảnh, siêu nhẹ — chuyên nghiệp, kín đáo.',
    traits: { angular: 0.85, topHeavy: 0 },
    compat: { oval: 85, round: 90, square: 40, oblong: 45, heart: 76, diamond: 66, triangle: 55 },
  },
  {
    id: 'cateyemetal', name: 'Mắt mèo kim loại', en: 'Metal cat-eye', shape: 'cateye', aspect: 0.7, widthScale: 1,
    rim: 'metal', thick: 1.0, bridge: 'metal', defaultColor: 'rosegold',
    desc: 'Dáng mắt mèo với viền kim loại mảnh — nâng gò má nhưng nhẹ nhàng hơn bản nhựa.',
    traits: { angular: 0.45, topHeavy: 0.5 },
    compat: { oval: 86, round: 80, square: 72, oblong: 56, heart: 62, diamond: 92, triangle: 88 },
  },
  {
    id: 'oversizedround', name: 'Tròn bản to', en: 'Oversized round', shape: 'round', aspect: 0.92, widthScale: 1.1,
    rim: 'full', thick: 3.0, bridge: 'keyhole', defaultColor: 'crystal',
    desc: 'Tròng tròn lớn, bản dày — trẻ trung, làm mềm hàm vuông, lấp chiều dài mặt.',
    traits: { angular: 0, topHeavy: 0 },
    compat: { oval: 56, round: 32, square: 86, oblong: 88, heart: 56, diamond: 60, triangle: 60 },
  },
  {
    id: 'invertedhalf', name: 'Viền dưới (Inverted half-rim)', en: 'Inverted half-rim', shape: 'rectangle', aspect: 0.66, widthScale: 1,
    rim: 'semiLow', thick: 2.6, bridge: 'metal', defaultColor: 'black',
    desc: 'Viền đậm ở nửa dưới, cước phía trên — kéo điểm nhấn xuống, cân bằng trán rộng.',
    traits: { angular: 0.6, topHeavy: -0.8 },
    compat: { oval: 80, round: 62, square: 68, oblong: 70, heart: 88, diamond: 70, triangle: 40 },
  },
  {
    id: 'rimlessoval', name: 'Không viền oval', en: 'Rimless oval', shape: 'oval', aspect: 0.7, widthScale: 1,
    rim: 'rimless', thick: 0.5, bridge: 'metal', defaultColor: 'gold',
    desc: 'Tròng oval khoan lỗ, không viền — gần như vô hình, làm mềm nét mặt góc cạnh.',
    traits: { angular: 0.1, topHeavy: -0.2 },
    compat: { oval: 85, round: 55, square: 86, oblong: 66, heart: 92, diamond: 88, triangle: 66 },
  },
  {
    id: 'flattop', name: 'Đỉnh phẳng (Flat-top)', en: 'Flat-top', shape: 'flattop', aspect: 0.74, widthScale: 1.02,
    rim: 'full', thick: 3.2, bridge: 'saddle', defaultColor: 'olive',
    desc: 'Viền trên thẳng như đường mày, đáy thu nhỏ — mạnh mẽ, cá tính.',
    traits: { angular: 0.8, topHeavy: 0.7 },
    compat: { oval: 82, round: 76, square: 58, oblong: 80, heart: 52, diamond: 70, triangle: 82 },
  },
  // --- Bổ sung theo khảo sát cửa hàng Hà Nội & xu hướng 2026 ---
  {
    id: 'pentagon', name: 'Ngũ giác', en: 'Pentagon', shape: 'pentagon', aspect: 0.8, widthScale: 1,
    rim: 'metal', thick: 1.0, bridge: 'metal', defaultColor: 'gold',
    desc: 'Ngũ giác kim loại mảnh, đỉnh phẳng — kiểu “hot trend” của các nhà mốt, rất được Gen Z ưa chuộng.',
    traits: { angular: 0.9, topHeavy: 0.3 },
    compat: { oval: 82, round: 86, square: 55, oblong: 62, heart: 68, diamond: 70, triangle: 72 },
  },
  {
    id: 'koreanclear', name: 'Tròn vuông Hàn Quốc', en: 'Korean soft square', shape: 'softsquare', aspect: 0.88, widthScale: 1,
    rim: 'full', thick: 2.4, bridge: 'keyhole', defaultColor: 'crystal',
    desc: 'Dáng tròn-vuông mềm, nhựa trong suốt hoặc màu nhạt — phong cách Hàn Quốc phổ biến ở các shop kính Hà Nội.',
    traits: { angular: 0.4, topHeavy: 0 },
    compat: { oval: 86, round: 70, square: 74, oblong: 76, heart: 70, diamond: 70, triangle: 64 },
  },
  {
    id: 'slimoval90s', name: 'Oval mảnh thập niên 90', en: '90s slim oval', shape: 'oval', aspect: 0.55, widthScale: 0.98,
    rim: 'full', thick: 1.8, bridge: 'saddle', defaultColor: 'black',
    desc: 'Oval hẹp, viền mảnh kiểu thập niên 90 — tối giản, “quiet luxury”.',
    traits: { angular: 0.1, topHeavy: 0 },
    compat: { oval: 80, round: 55, square: 86, oblong: 42, heart: 76, diamond: 82, triangle: 60 },
  },
  {
    id: 'narrowrect90s', name: 'Chữ nhật hẹp Y2K', en: 'Y2K narrow rectangle', shape: 'rectangle', aspect: 0.5, widthScale: 0.98,
    rim: 'full', thick: 2.0, bridge: 'saddle', defaultColor: 'black',
    desc: 'Chữ nhật nhỏ, hẹp kiểu thập niên 90–2000 đang quay lại — năng động, cá tính.',
    traits: { angular: 0.9, topHeavy: 0 },
    compat: { oval: 82, round: 86, square: 40, oblong: 35, heart: 62, diamond: 58, triangle: 50 },
  },
  {
    id: 'oversizedrect', name: 'Chữ nhật bản to', en: 'Oversized rectangle', shape: 'rectangle', aspect: 0.72, widthScale: 1.12,
    rim: 'full', thick: 3.2, bridge: 'saddle', defaultColor: 'tortoise',
    desc: '“Power shape” của 2026: chữ nhật rộng, chiều cao vừa phải, bản acetate dày.',
    traits: { angular: 0.8, topHeavy: 0 },
    compat: { oval: 58, round: 82, square: 50, oblong: 86, heart: 58, diamond: 62, triangle: 62 },
  },
  {
    id: 'softcateye', name: 'Mắt mèo mềm', en: 'Soft cat-eye', shape: 'softcateye', aspect: 0.74, widthScale: 1,
    rim: 'full', thick: 2.6, bridge: 'saddle', defaultColor: 'tortoise',
    desc: 'Mắt mèo vểnh nhẹ, dễ đeo hằng ngày và đi làm — nữ tính mà không quá phô.',
    traits: { angular: 0.4, topHeavy: 0.6 },
    compat: { oval: 88, round: 82, square: 78, oblong: 60, heart: 58, diamond: 92, triangle: 90 },
  },
  {
    id: 'chunkysquare', name: 'Vuông bản dày (Chunky)', en: 'Chunky square', shape: 'softsquare', aspect: 0.82, widthScale: 1.04,
    rim: 'full', thick: 4.4, bridge: 'saddle', defaultColor: 'black',
    desc: 'Acetate dày bản, góc bo — phong cách thời trang Hàn, nổi bật và cá tính.',
    traits: { angular: 0.7, topHeavy: 0.1 },
    compat: { oval: 80, round: 84, square: 40, oblong: 78, heart: 55, diamond: 55, triangle: 52 },
  },
  {
    id: 'titaniumprogressive', name: 'Nửa viền titan bản sâu', en: 'Deep titanium half-rim', shape: 'rectangle', aspect: 0.72, widthScale: 1,
    rim: 'semi', thick: 1.8, bridge: 'metal', defaultColor: 'gunmetal',
    desc: 'Titan siêu nhẹ, nửa viền trên, tròng đủ cao cho kính đa tròng/kính lão — lịch sự, bền.',
    traits: { angular: 0.7, topHeavy: 0.5 },
    compat: { oval: 85, round: 78, square: 74, oblong: 70, heart: 55, diamond: 84, triangle: 92 },
  },
  {
    id: 'kidsflex', name: 'Dẻo TR90 trẻ em', en: 'Kids flexible TR90', shape: 'panto', aspect: 0.86, widthScale: 1,
    rim: 'full', thick: 2.8, bridge: 'keyhole', defaultColor: 'navy',
    desc: 'Nhựa dẻo TR90/silicone, không vít, khó gãy, nhiều màu — dành cho trẻ em.',
    traits: { angular: 0.3, topHeavy: 0 },
    compat: { oval: 80, round: 72, square: 78, oblong: 74, heart: 74, diamond: 72, triangle: 70 },
  },
  {
    id: 'slimaviator', name: 'Phi công mảnh', en: 'Slim aviator', shape: 'aviator', aspect: 0.8, widthScale: 1,
    rim: 'metal', thick: 0.8, bridge: 'double', defaultColor: 'gold',
    desc: 'Aviator phiên bản 2026: viền mảnh, nhẹ hơn, tròng thấp hơn — hợp đeo cận hằng ngày.',
    traits: { angular: 0.2, topHeavy: -0.5 },
    compat: { oval: 86, round: 70, square: 82, oblong: 74, heart: 90, diamond: 70, triangle: 58 },
  },
  {
    id: 'retrooval', name: 'Oval retro bản dày', en: 'Retro oval', shape: 'oval', aspect: 0.78, widthScale: 1,
    rim: 'full', thick: 3.0, bridge: 'saddle', defaultColor: 'brown',
    desc: 'Oval acetate dày kiểu retro — ấm áp, trí thức, hợp nhiều độ tuổi.',
    traits: { angular: 0.1, topHeavy: 0 },
    compat: { oval: 82, round: 45, square: 90, oblong: 76, heart: 74, diamond: 88, triangle: 66 },
  },
  {
    id: 'sportywrap', name: 'Thể thao ôm mặt', en: 'Sporty wrap', shape: 'wrap', aspect: 0.58, widthScale: 1.06,
    rim: 'full', thick: 2.8, bridge: 'saddle', defaultColor: 'black',
    desc: 'Dáng ôm sát mặt, nhựa dẻo — năng động, chơi thể thao, đi xe máy.',
    traits: { angular: 0.8, topHeavy: 0.2 },
    compat: { oval: 80, round: 80, square: 50, oblong: 55, heart: 62, diamond: 62, triangle: 58 },
  },
];

// Chất liệu và phong cách — dùng cho bộ lọc và gợi ý theo sở thích.
export const STYLE_TAGS = {
  office: 'Công sở', fashion: 'Thời trang', classic: 'Cổ điển', minimal: 'Tối giản', bold: 'Cá tính', youthful: 'Trẻ trung', sport: 'Thể thao',
};
export const MATERIALS = { acetate: 'Nhựa acetate', metal: 'Kim loại', rimless: 'Không viền', mixed: 'Nhựa + kim loại' };
const FRAME_META = {
  rectangle: ['acetate', ['office', 'minimal']],
  square: ['acetate', ['bold', 'fashion']],
  wayfarer: ['acetate', ['classic', 'youthful']],
  round: ['acetate', ['classic', 'youthful']],
  oval: ['acetate', ['office', 'minimal']],
  cateye: ['acetate', ['fashion', 'bold']],
  aviator: ['metal', ['classic', 'bold']],
  browline: ['mixed', ['classic', 'office']],
  geometric: ['metal', ['fashion', 'bold']],
  panto: ['acetate', ['classic', 'youthful']],
  dframe: ['acetate', ['youthful', 'fashion']],
  oversized: ['acetate', ['fashion', 'bold']],
  rimless: ['rimless', ['minimal', 'office']],
  semirimless: ['mixed', ['office', 'minimal']],
  softsquare: ['acetate', ['youthful', 'office']],
  octagon: ['metal', ['fashion', 'youthful']],
  butterfly: ['acetate', ['fashion', 'bold']],
  clubround: ['mixed', ['classic', 'fashion']],
  roundwire: ['metal', ['classic', 'minimal']],
  navigator: ['metal', ['bold', 'classic']],
  metalrect: ['metal', ['office', 'minimal']],
  cateyemetal: ['metal', ['fashion', 'office']],
  oversizedround: ['acetate', ['youthful', 'fashion']],
  invertedhalf: ['mixed', ['office', 'bold']],
  rimlessoval: ['rimless', ['minimal', 'office']],
  flattop: ['acetate', ['bold', 'fashion']],
  pentagon: ['metal', ['fashion', 'bold']],
  koreanclear: ['acetate', ['youthful', 'minimal']],
  slimoval90s: ['acetate', ['fashion', 'minimal']],
  narrowrect90s: ['acetate', ['fashion', 'youthful']],
  oversizedrect: ['acetate', ['fashion', 'bold']],
  softcateye: ['acetate', ['fashion', 'office']],
  chunkysquare: ['acetate', ['bold', 'fashion']],
  titaniumprogressive: ['metal', ['office', 'classic']],
  kidsflex: ['acetate', ['youthful', 'sport']],
  slimaviator: ['metal', ['classic', 'minimal']],
  retrooval: ['acetate', ['classic', 'fashion']],
  sportywrap: ['acetate', ['sport', 'youthful']],
};
for (const f of FRAMES) [f.material, f.tags] = FRAME_META[f.id];

// Mức độ ưa chuộng theo giới tính và độ tuổi (0 = hiếm, 3 = rất phổ biến).
// Tổng hợp định tính từ khảo sát cửa hàng kính Hà Nội, báo cáo xu hướng 2026 và khảo sát All About Vision
// (xem SOURCES) — không phải số liệu doanh số.
export const GENDERS = { female: 'Nữ', male: 'Nam' };
export const AGE_GROUPS = { kid: 'Trẻ em (<13)', genz: 'Gen Z (13–24)', young: '25–39 tuổi', middle: '40–54 tuổi', senior: '55+ tuổi' };
//                 [nữ, nam, trẻ em, genz, 25–39, 40–54, 55+]
const POPULARITY = {
  rectangle: [2, 3, 1, 2, 3, 3, 3],
  square: [2, 3, 1, 2, 3, 2, 1],
  wayfarer: [2, 3, 1, 2, 3, 2, 1],
  round: [2, 2, 2, 3, 2, 1, 1],
  oval: [2, 2, 1, 1, 2, 3, 3],
  cateye: [3, 0, 0, 2, 3, 2, 1],
  aviator: [1, 3, 0, 1, 2, 3, 2],
  browline: [1, 3, 0, 1, 3, 3, 2],
  geometric: [2, 2, 0, 3, 2, 1, 0],
  panto: [2, 2, 1, 3, 2, 1, 1],
  dframe: [2, 2, 0, 2, 2, 1, 0],
  oversized: [3, 1, 0, 3, 3, 1, 0],
  rimless: [2, 2, 0, 0, 1, 3, 3],
  semirimless: [1, 3, 0, 0, 2, 3, 3],
  softsquare: [2, 2, 1, 3, 3, 2, 1],
  octagon: [2, 2, 0, 3, 2, 1, 0],
  butterfly: [3, 0, 0, 1, 2, 2, 1],
  clubround: [1, 2, 0, 2, 2, 1, 0],
  roundwire: [2, 2, 0, 3, 2, 1, 1],
  navigator: [0, 3, 0, 1, 2, 3, 1],
  metalrect: [1, 3, 0, 1, 2, 3, 3],
  cateyemetal: [3, 0, 0, 2, 3, 2, 1],
  oversizedround: [3, 1, 0, 3, 2, 1, 0],
  invertedhalf: [1, 2, 0, 0, 1, 2, 2],
  rimlessoval: [3, 1, 0, 0, 1, 3, 3],
  flattop: [2, 2, 0, 2, 2, 1, 0],
  pentagon: [3, 1, 0, 3, 2, 0, 0],
  koreanclear: [3, 2, 1, 3, 3, 1, 0],
  slimoval90s: [3, 1, 0, 3, 2, 1, 0],
  narrowrect90s: [2, 2, 0, 3, 2, 0, 0],
  oversizedrect: [3, 2, 0, 2, 3, 1, 0],
  softcateye: [3, 0, 0, 1, 3, 3, 2],
  chunkysquare: [2, 3, 0, 3, 2, 1, 0],
  titaniumprogressive: [2, 3, 0, 0, 1, 3, 3],
  kidsflex: [2, 2, 3, 0, 0, 0, 0],
  slimaviator: [1, 3, 0, 2, 3, 2, 1],
  retrooval: [2, 2, 0, 1, 3, 2, 2],
  sportywrap: [1, 3, 2, 3, 1, 0, 0],
};
for (const f of FRAMES) {
  const p = POPULARITY[f.id];
  f.pop = { female: p[0], male: p[1], kid: p[2], genz: p[3], young: p[4], middle: p[5], senior: p[6] };
}

// Ghi chú xu hướng theo nhóm (hiển thị ở tab Kiến thức).
export const TREND_NOTES = [
  { group: 'Gen Z (13–24)', text: 'Ưa kiểu thập niên 90–2000: gọng kim loại mảnh, acetate mảnh; gọng hình học (ngũ giác, lục giác) — Gen Z chọn gọng hình học nhiều hơn ~6 lần thế hệ boomer; phong cách Hàn Quốc, nhựa trong suốt.' },
  { group: '25–39 tuổi', text: 'Gọng trong suốt (millennial chọn nhiều gấp đôi Gen Z), bản to, oval retro, vuông; gọng công sở chữ nhật/browline.' },
  { group: '40–54 tuổi', text: 'Kiểu cổ điển, thanh lịch: chữ nhật, browline, nửa viền, không viền; titan nhẹ; tròng đủ cao cho đa tròng.' },
  { group: '55+ tuổi', text: 'Gọng nhẹ, bền (titan, TR90, bản lề lò xo), màu trầm (đen, nâu, xám, vàng ánh kim); không viền / nửa viền; kính lão, đa tròng.' },
  { group: 'Trẻ em', text: 'Nhựa dẻo TR90/silicone, không vít, khó gãy; dáng tròn hoặc vuông bo; nhiều màu.' },
  { group: 'Nữ', text: 'Mắt mèo và gọng nhựa được nữ tự chọn nhiều hơn; oval mảnh, tròn tối giản, chữ nhật bản to, cánh bướm.' },
  { group: 'Nam', text: 'Nam chọn phi công và gọng kim loại nhiều hơn; chữ nhật, browline (được đánh giá chuyên nghiệp nhất), titan nửa viền, hình học, đồi mồi.' },
  { group: 'Chung', text: 'Chữ nhật là lựa chọn số 1, vuông đứng sau sát nút; gần một nửa người được hỏi thích màu đen, xanh dương đứng thứ hai.' },
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
  { id: 'forest', name: 'Xanh rêu đậm', hex: '#2f4a3a', tones: ['warm', 'neutral'], kind: 'acetate' },
  { id: 'metalpink', name: 'Hồng kim loại', hex: '#d39aad', tones: ['cool', 'neutral'], kind: 'metal' },
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
  { title: 'All About Vision — Perceptions of different glasses shapes (khảo sát 862 người, theo giới & thế hệ)', url: 'https://www.allaboutvision.com/eyewear/eyeglasses/styles/perceptions-of-different-glasses-shapes/' },
  { title: 'VnEconomy — Thương hiệu thời trang coi kính mắt là “vùng đất” mới (Gen Z vs millennial)', url: 'https://vneconomy.vn/thuong-hieu-thoi-trang-coi-kinh-mat-la-vung-dat-moi.htm' },
  { title: 'Tuổi Trẻ — 5 xu hướng kính mát chiếm sóng mùa hè 2026', url: 'https://tuoitre.vn/5-xu-huong-kinh-mat-chiem-song-mua-he-2026-20260509103847047.htm' },
  { title: 'Jimmy Fairly — The eyewear shapes that will dominate 2026', url: 'https://www.jimmyfairly.com/blogs/revista/the-eyewear-shapes-that-will-dominate-2026' },
  { title: 'BonLook — Men’s glasses frames currently trending', url: 'https://www.bonlook.com/blogs/blog/which-mens-glasses-frames-are-currently-trending' },
  { title: 'AOP — Five eyewear trends from 100% Optical 2026', url: 'https://www.aop.org.uk/ot/100-percent-optical/2026/08/02/five-eyewear-trends-from-100-optical-2026' },
  { title: 'Toplist — Địa chỉ bán gọng kính ở Hà Nội', url: 'https://toplist.vn/top-list/dia-chi-ban-gong-kinh-gia-re-va-chat-luong-o-ha-noi-25910.htm' },
  { title: 'Mytour — Top cửa hàng kính mắt uy tín tại Hà Nội', url: 'https://mytour.vn/vi/blog/bai-viet/top-15-cua-hang-kinh-mat-uy-tin-tai-ha-noi-chat-luong-khong-the-bo-lo.html' },
  { title: 'Toplist — Thương hiệu mắt kính được ưa chuộng nhất', url: 'https://toplist.vn/top-list/thuong-hieu-mat-kinh-duoc-ua-chuong-nhat-hien-nay-8263.htm' },
  { title: 'Thế Giới Di Động — Chọn kính thời trang cho người lớn tuổi', url: 'https://www.thegioididong.com/hoi-dap/chon-mua-mat-kinh-thoi-trang-cho-nguoi-lon-tuoi-nguoi-1409132' },
];
