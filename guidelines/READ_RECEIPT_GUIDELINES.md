# 📖 Tài liệu Tích hợp Cơ chế Đếm Tin nhắn Chưa đọc

Tài liệu này cung cấp hướng dẫn chi tiết về cách thức xử lý logic phía Front-end nhằm đồng bộ hóa trạng thái tin nhắn chưa đọc với hệ thống Redis phía Back-end.

## 🏛️ 1. Tổng quan Kiến trúc

Hệ thống Back-end hiện tại sử dụng bộ nhớ đệm **Redis** để theo dõi số lượng tin nhắn chưa đọc của từng cá nhân trong từng phòng trò chuyện. Cơ chế này giúp:
- Tối ưu hóa hiệu năng.
- Giảm thiểu độ trễ so với việc truy vấn trực tiếp vào cơ sở dữ liệu quan hệ.

Tuy nhiên, hệ thống Back-end **không thể tự động nhận biết** trạng thái trực tuyến của người dùng tại một phòng trò chuyện cụ thể khi dữ liệu được truyền tải qua giao thức WebSocket. Do đó, tầng Front-end cần đảm nhiệm vai trò thông báo ngược lại cho hệ thống thông qua các giao thức HTTP API.

---

## 🔗 2. Các Điểm cuối API (Endpoints) Cung cấp

Bộ phận Back-end đã thiết lập sẵn các điểm tiếp nhận dữ liệu sau:

### Lấy danh sách tin nhắn
- **Endpoint:** `GET /api/conversations/{id}/messages?conversationId={id}`
- **Hành vi ngầm định:** Khi gọi lệnh này, hệ thống sẽ tự động đặt lại bộ đếm trên Redis về `0`.

### Xác nhận đã đọc (Thủ công)
- **Endpoint:** `PUT /api/conversations/{conversationId}/read?userId={userId}`
- **Chức năng:** Xóa bộ đếm tin nhắn chưa đọc của một phòng trò chuyện cụ thể trên hệ thống Redis.

---

## ⚙️ 3. Quy trình Xử lý Logic tại Front-end

Khi tầng Front-end tiếp nhận một sự kiện tin nhắn mới từ kênh WebSocket, hệ thống cần thực hiện phân nhánh luồng kiểm tra dựa trên trạng thái hiển thị hiện tại của giao diện.

### 🟢 Kịch bản A: Người dùng đang mở chính phòng trò chuyện đó
- **Điều kiện:** Biến trạng thái lưu trữ ID phòng trò chuyện đang mở (`activeConversationId`) trùng khớp với ID phòng trò chuyện của tin nhắn vừa nhận.
- **Hành động cần thiết:**
  1. Hiển thị tin nhắn mới lên giao diện ngay lập tức.
  2. Thực thi lệnh gọi API `PUT` đến điểm cuối **xác nhận đã đọc**. Hành động này đảm bảo bộ đếm trên Redis bị triệt tiêu, ngăn chặn tình trạng hệ thống ghi nhận sai lệch số lượng tin nhắn chưa đọc.
  3. Không gia tăng biến đếm biểu tượng thông báo trên giao diện.

### 🔴 Kịch bản B: Người dùng đang ở màn hình khác hoặc mở phòng trò chuyện khác
- **Điều kiện:** Biến trạng thái lưu trữ ID phòng trò chuyện đang mở không khớp với ID phòng trò chuyện của tin nhắn vừa nhận, hoặc người dùng đang ở trang chủ.
- **Hành động cần thiết:**
  1. **Không** thực hiện lệnh gọi API xác nhận đã đọc.
  2. Cập nhật trạng thái cục bộ *(State Management)* để gia tăng số lượng trên biểu tượng thông báo màu đỏ tại danh sách phòng trò chuyện tương ứng.

---

## 💻 4. Đoạn mã Tham khảo (Mã giả lập cho React/JavaScript)

Dưới đây là mô hình xử lý mẫu khi tiếp nhận tải trọng dữ liệu từ kênh WebSocket:

```javascript
// Hàm xử lý sự kiện khi có tin nhắn mới từ WebSocket
const handleIncomingWebSocketMessage = async (incomingMessage) => {
    const { conversationId } = incomingMessage;
    const currentActiveConversationId = store.getState().chat.activeConversationId;
    const currentUserId = store.getState().auth.userId;

    if (currentActiveConversationId === conversationId) {
        // Kịch bản A: Đang xem trực tiếp phòng trò chuyện
        appendMessageToUI(incomingMessage);
        
        try {
            // Gửi tín hiệu đồng bộ hóa cho Back-end
            await apiClient.put(`/api/messages/conversations/${conversationId}/read`, null, {
                params: { userId: currentUserId }
            });
        } catch (error) {
            console.error(error);
        }
    } else {
        // Kịch bản B: Không tập trung vào phòng trò chuyện này
        incrementUnreadBadgeForConversation(conversationId);
        showToastNotification(incomingMessage);
    }
};
```
