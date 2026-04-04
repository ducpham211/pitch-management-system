# 🤖 Tài liệu Tích hợp API Đánh giá Đối thủ (AI Fair-Play Review)

## 📌 1. Tổng quan chức năng
Tính năng này cho phép người dùng (thường là đội trưởng) viết đánh giá về đội đối thủ sau trận đấu.
Điểm đặc biệt: Trọng tài AI (sử dụng nền tảng Groq LPU siêu tốc) sẽ tự động đọc hiểu nội dung đánh giá để phát hiện các hành vi phi thể thao (chơi xấu, bạo lực, chửi thề...).
- Nếu review bình thường: Pass tự động.
- Nếu review báo cáo lỗi vi phạm: AI sẽ tự động đề xuất mức phạt và báo cáo lên Admin để chờ duyệt trừ điểm Uy tín (`trust_score`).

---

## 🔗 2. Chi tiết API (Endpoint)

- **Method:** `POST`
- **URL:** `/api/reviews`
- **Headers:** 
    - `Content-Type: application/json`
    - `Authorization: Bearer <JWT_TOKEN>` *(Bắt buộc)*

---

## 📥 3. Cấu trúc Request Body (Frontend gửi lên)

**Lưu ý Bảo mật:** Frontend **KHÔNG** được gửi lên `reviewerId` (ID của người đang thao tác). Backend sẽ tự động trích xuất ID này một cách bảo mật từ Token đăng nhập.

```json
{
  "revieweeId": "uuid-cua-nguoi-bi-danh-gia", 
  "matchRequestId": "uuid-cua-tran-dau",
  "reason": "Nội dung người dùng viết (VD: Trận đấu rất hay / Đội kia đá quá thô bạo)"
}
```

Mô tả các trường:
- `revieweeId` (String/UUID): ID của Đội trưởng đội đối thủ (người sẽ chịu trách nhiệm nhận đánh giá).
- `matchRequestId` (String/UUID): ID của phiên bắt kèo / trận đấu tương ứng.
- `reason` (String): Nội dung text do người dùng nhập vào Form đánh giá.

---

## 📤 4. Cấu trúc Response (Backend trả về)
Khi thành công (HTTP Status 200 OK), Backend sẽ trả về Object chứa thông tin đánh giá đã được AI phân tích:

```json
{
  "id": "uuid-cua-review-vua-tao",
  "reviewerId": "uuid-nguoi-danh-gia",
  "revieweeId": "uuid-nguoi-bi-danh-gia",
  "matchRequestId": "uuid-cua-tran-dau",
  "scoreChange": 0, 
  "reason": "Đội kia đá quá thô bạo",
  "aiSuggestedPenalty": 10,
  "status": "PENDING_ADMIN_REVIEW",
  "createdAt": "2026-04-04T14:30:00.123"
}
```

🧠 Giải thích các Trạng thái (status) trả về:
- `AUTO_PASSED`: Đánh giá mang tính tích cực hoặc bình thường. Điểm phạt = 0. Đánh giá được ghi nhận trực tiếp.
- `PENDING_ADMIN_REVIEW`: AI phát hiện nội dung độc hại, bạo lực, phi thể thao. Hệ thống đang tạm giữ đánh giá này và đề xuất mức phạt (`aiSuggestedPenalty`). Admin sẽ duyệt để trừ điểm.

---

## 💡 5. Khuyến nghị xử lý UI/UX cho Frontend
Để mang lại trải nghiệm tốt nhất cho người dùng, Frontend nên xử lý theo luồng sau:

1. **Trạng thái Loading:** Khi user bấm nút "Gửi đánh giá", hãy hiển thị Loading Spinner. (AI của Groq xử lý rất nhanh, thường < 1s, nhưng vẫn cần Loading để chặn user click nhiều lần).

2. **Hiển thị thông báo (Toast/Alert) dựa vào status trả về:**
   - Nếu `status === 'AUTO_PASSED'`: Hiển thị Toast màu Xanh (Success): "Cảm ơn bạn đã gửi đánh giá! Chúc bạn có những trận bóng vui vẻ."
   - Nếu `status === 'PENDING_ADMIN_REVIEW'`: Hiển thị Toast màu Vàng (Warning/Info) hoặc Modal: "Đánh giá của bạn đã được AI ghi nhận có chứa báo cáo vi phạm phi thể thao. Quản trị viên sẽ xem xét và xử lý đội đối thủ sớm nhất!"

3. **Reset Form:** Sau khi nhận Response thành công, clear text trong ô nhập liệu và đóng Modal/Form đánh giá.

---

*Bạn có thể lưu nội dung này thành một file `AI_Review_API_Docs.md` và gửi thẳng cho nhóm làm giao diện.*

*Bạn có muốn mình hướng dẫn thêm cách viết các test case tự động (JUnit test) cho API này không?*