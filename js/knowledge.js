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

// Danh mục gọng: sản phẩm thật của Kính mắt Anna (xem catalog.js).
export { FRAMES, FAMILIES, MATERIALS, GENDERS, COLLECTIONS, BUDGETS, CATALOG_SOURCE } from './catalog.js?v=mwxubh1n';

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
  { title: 'Kính mắt Anna — danh mục gọng kính (nguồn dữ liệu gọng của ứng dụng)', url: 'https://kinhmatanna.com/vi/products/gong-kinh' },
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
