# KínhFit AI — đánh giá gọng kính hợp khuôn mặt

Ứng dụng web chạy trên `localhost`, dùng camera laptop để:

- Nhận diện **478 điểm mốc** khuôn mặt + mống mắt (MediaPipe Face Landmarker, chạy trong trình duyệt).
- Đo **PD, bề ngang thái dương / gò má / trán / hàm** (mm), dùng mống mắt ≈ 11,7 mm làm thước.
- Phân loại **7 dáng mặt** (oval, tròn, vuông, dài, trái tim, kim cương, tam giác) kèm xác suất.
- Gợi ý **cỡ gọng** (tròng □ cầu – càng) và chấm điểm **216 mẫu gọng thật của Kính mắt Anna** (dáng, chất liệu, kích thước, màu, giá).
- **AI gợi ý gọng phù hợp nhất** ngay khi bật camera, cá nhân hoá theo dáng gọng / chất liệu / giới tính / ngân sách / nhu cầu và nút Thích – Bỏ qua.
- **Thử kính ảo** theo thời gian thực, đổi màu, cỡ, loại tròng; kiểm tra độ vừa (bề ngang, tâm đồng tử, lông mày, gò má, progressive).
- Ước tính **tông da** (CIELAB, ITA°) và **màu mắt** → gợi ý màu gọng.
- Chụp ảnh để **so sánh** các gọng cạnh nhau, lưu ảnh về máy.

## Chạy

Cần Node.js (không cần cài thêm thư viện).

- Windows: bấm đúp `start.bat` → trình duyệt mở `http://localhost:8080`.
- Hoặc: `node server.js 8080` rồi mở `http://localhost:8080`.

Lần đầu cần Internet để tải mô hình AI (~4 MB) từ CDN; ảnh camera **không** gửi đi đâu.

## Cập nhật bản online (GitHub Pages)

GitHub Pages cho trình duyệt giữ file cũ tới 10 phút. Trước mỗi lần commit, chạy `node bump-version.js` để đổi số phiên bản `?v=…` trong đường dẫn — người dùng chỉ cần tải lại trang là nhận bản mới.

## Cấu trúc

- `js/knowledge.js` — tri thức: dáng mặt, tông da, cỡ, xu hướng, nguồn tham khảo.
- `js/catalog.js` + `js/catalog-data.js` — 216 mẫu gọng từ kinhmatanna.com (dựng lại bằng `node tools/build-catalog.js` từ `data/anna-raw.json`).
- `js/analysis.js` — đo đạc, phân loại dáng mặt, gợi ý cỡ, kiểm tra độ vừa, chấm điểm, phân tích màu.
- `js/render.js` — vẽ gọng kính 2.5D theo mm (dáng oval, tròn, vuông, chữ nhật, đa giác, mắt mèo; nhựa / kim loại / titan / không viền / browline; gọng hai tông).
- `js/app.js` — camera, vòng lặp nhận diện, giao diện.

Kết quả mang tính tham khảo; số đo PD/tròng đa tròng nên xác nhận tại cửa hàng kính.
