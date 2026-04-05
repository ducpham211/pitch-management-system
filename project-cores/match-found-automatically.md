### 1. Lọc thô tại Cơ sở dữ liệu (Database Pre-filtering)
Hệ thống không gửi toàn bộ cơ sở dữ liệu cho AI phân tích. Thay vào đó, Spring Boot thực thi truy vấn PostgreSQL để trích xuất một tập hợp nhỏ các trận đấu tiềm năng đang ở trạng thái chờ ghép cặp. Giai đoạn này giúp:
- Loại bỏ các bản ghi không hợp lệ.
- Tối ưu hóa thời gian xử lý.
- Tiết kiệm dung lượng ngữ cảnh (token) của mô hình ngôn ngữ lớn.

### 2. Chuẩn hóa và Đóng gói Dữ liệu (Data Packaging)
Dữ liệu thô từ thực thể `MatchPost` được chuyển đổi thành các đối tượng truyền tải dữ liệu dung lượng nhẹ (`AiOpponentDto`). Tại đây, hệ thống tiến hành:
- Loại bỏ các thuộc tính dư thừa.
- Chỉ giữ lại các trường thông tin trọng yếu bao gồm: mã định danh, điểm uy tín và mô tả phong cách thi đấu.
*Khâu này đảm bảo đối tượng truyền đi được nguyên vẹn và không chứa giá trị rỗng.*

### 3. Phân tích Ngữ nghĩa qua Trí tuệ Nhân tạo (LLM Processing)
Danh sách đối tượng đã đóng gói được chuyển hóa thành chuỗi JSON và đính kèm vào bộ chỉ thị (prompt) gửi đến máy chủ Groq. 
- Mô hình ngôn ngữ lớn tiến hành đối chiếu mức độ tương đồng về văn phong thi đấu và tính toán sự cân bằng về điểm số uy tín để chọn ra **3 đối tác phù hợp nhất**. 
- Điểm đặc biệt của giai đoạn này là bộ lọc lỗi cắt chuỗi, ép buộc kết quả trả về phải tuân thủ nghiêm ngặt định dạng mảng JSON.

### 4. Hậu xử lý và Phản hồi (Post-processing & Response)
- Thư viện Jackson đảm nhiệm việc phân tích cú pháp chuỗi JSON do AI sinh ra. 
- Các mã định danh sau đó được ánh xạ ngược lại với danh sách dữ liệu gốc tại *Bước 1* để truy xuất thông tin đầy đủ. 
- Cuối cùng, hệ thống khởi tạo danh sách đối tượng `RecommendedMatchResponse`, bao gồm dữ liệu trận đấu thực tế đính kèm lời giải thích bằng ngôn ngữ tự nhiên từ AI, và chuyển giao về cho ứng dụng máy khách.
