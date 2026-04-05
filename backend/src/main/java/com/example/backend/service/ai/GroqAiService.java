package com.example.backend.service.ai;

import com.example.backend.dto.aiChatBot.request.ChatCreateRequest;
import com.example.backend.dto.aiChatBot.response.ChatResponse;
import com.example.backend.dto.aiOpponentRecommendation.AiOpponentDto;
import com.example.backend.dto.aiOpponentRecommendation.AiRecommendationResult;
import com.example.backend.repository.redis.ChatSessionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.backend.entity.redis.ChatSession;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;
@Slf4j
@Service
@RequiredArgsConstructor

public class GroqAiService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.api.model}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper; // Dùng để bóc tách JSON
    private final ChatSessionRepository chatSessionRepository; // Khai báo Repository Redis

    // Record tĩnh để lưu kết quả phân tích
    public record AiAnalysisResult(boolean isToxic, int penaltyScore, String aiReason) {
    }

    public AiAnalysisResult analyzeReview(String content) {
        try {
            // 1. Chuẩn bị Prompt ép trả về JSON
            String prompt = String.format(
                    "Bạn là một trọng tài AI phân tích đánh giá trận đấu bóng đá phủi. " +
                            "Đọc đánh giá sau: '%s'. " +
                            "Hãy xác định xem đánh giá này có phàn nàn về hành vi phi thể thao (chơi thô bạo, chửi thề, bỏ giải, bạo lực) hay không. " +
                            "Chỉ trả về ĐÚNG MỘT OBJECT JSON theo định dạng sau, không kèm bất kỳ ký tự markdown hay text nào khác: " +
                            "{\"isToxic\": true/false, \"penaltyScore\": <số điểm đề xuất trừ, ví dụ 5, 10, 20. Không vi phạm là 0>, \"reason\": \"<lý do ngắn gọn>\"}",
                    content
            ).replace("\"", "\\\""); // Escape dấu ngoặc kép an toàn

            // 2. Build Request Body theo chuẩn OpenAI/Groq
            String requestBody = """
                    {
                      "model": "%s",
                      "messages": [
                        {
                          "role": "user",
                          "content": "%s"
                        }
                      ],
                      "temperature": 0.2
                    }
                    """.formatted(model, prompt);

            // 3. Setup Headers (Truyền API Key vào Bearer Token)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey); // Set Bearer token tự động

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            // 4. Bắn Request lên hệ thống Groq Cloud
            String response = restTemplate.postForObject(apiUrl, requestEntity, String.class);

            // 5. Bóc tách JSON trả về từ Groq
            JsonNode rootNode = objectMapper.readTree(response);

            // Đường dẫn đọc kết quả chuẩn của OpenAI/Groq
            String aiTextResponse = rootNode.path("choices").get(0)
                    .path("message").path("content").asText();

            // Xóa rác markdown (ví dụ ```json ... ```) nếu con AI lỡ tay sinh ra
            aiTextResponse = aiTextResponse.replaceAll("```json", "").replaceAll("```", "").trim();

            // Chuyển JSON string thành Record Java
            JsonNode resultNode = objectMapper.readTree(aiTextResponse);
            return new AiAnalysisResult(
                    resultNode.get("isToxic").asBoolean(),
                    resultNode.get("penaltyScore").asInt(),
                    resultNode.get("reason").asText()
            );

        } catch (Exception e) {
            log.error("==== LỖI GỌI GROQ AI ====", e);
            // Fallback an toàn nếu Groq bị sập hoặc quá tải
            return new AiAnalysisResult(false, 0, "Không thể phân tích do lỗi kết nối AI");
        }
    }

    public List<AiRecommendationResult> recommendOpponents(
            String currentTeamPlaystyle,
            int currentTrustScore,
            List<AiOpponentDto> potentialOpponents) {

        try {
            // Chuyển danh sách đội tiềm năng thành chuỗi JSON
            String opponentsJson = objectMapper.writeValueAsString(potentialOpponents);

            // Prompt thép: Ép AI chỉ nhả JSON
            String prompt = String.format(
                    "Bạn là một hệ thống AI ghép kèo bóng đá. Tuyệt đối KHÔNG giao tiếp như con người. " +
                            "Thông tin đội chủ nhà: Lối đá: '%s', Uy tín: %d/100. " +
                            "Danh sách đối thủ (JSON): %s. " +
                            "Nhiệm vụ: Chọn 3 đội phù hợp nhất. " +
                            "QUY TẮC BẮT BUỘC: Chỉ trả về duy nhất một mảng JSON có định dạng [{\"matchId\": \"...\", \"aiReason\": \"...\"}]. " +
                            "Tuyệt đối không thêm bất kỳ từ ngữ nào ngoài JSON. Nếu danh sách đối thủ trống, trả về [].",
                    currentTeamPlaystyle, currentTrustScore, opponentsJson
            ).replace("\"", "\\\"");

            String requestBody = """
                    {
                      "model": "%s",
                      "messages": [
                        {
                          "role": "user",
                          "content": "%s"
                        }
                      ],
                      "temperature": 0.4
                    }
                    """.formatted(model, prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            // Bắn Request lên Groq
            String response = restTemplate.postForObject(apiUrl, requestEntity, String.class);

            JsonNode rootNode = objectMapper.readTree(response);
            String aiTextResponse = rootNode.path("choices").get(0).path("message").path("content").asText();

            // Lọc lấy đúng phần JSON (từ [ đến ])
            int startIndex = aiTextResponse.indexOf('[');
            int endIndex = aiTextResponse.lastIndexOf(']');

            if (startIndex != -1 && endIndex != -1 && startIndex < endIndex) {
                String cleanJson = aiTextResponse.substring(startIndex, endIndex + 1);
                return objectMapper.readValue(cleanJson, new TypeReference<List<AiRecommendationResult>>() {
                });
            } else {
                System.out.println("LỖI AI TRẢ VỀ RÁC: " + aiTextResponse);
                return List.of(); // Trả về list rỗng, không làm sập server
            }

        } catch (Exception e) {
            // Nhớ import org.slf4j.Logger và LoggerFactory ở đầu class nếu log báo đỏ nhé
            log.error("==== LỖI GỌI GROQ AI GỢI Ý ====", e);
            return List.of();
        }
    }
    public ChatResponse askChatbot(ChatCreateRequest request) {
        try {
            // 1. Quản lý Mã định danh Phiên làm việc
            String currentSessionId = request.getSessionId();
            if (currentSessionId == null || currentSessionId.trim().isEmpty()) {
                currentSessionId = UUID.randomUUID().toString();
            }

            // 2. Truy xuất hoặc Khởi tạo Phiên hội thoại từ Redis
          ChatSession session = chatSessionRepository.findById(currentSessionId)
                    .orElse(new ChatSession(currentSessionId, new ArrayList<>()));

            // Nếu là phiên hoàn toàn mới, đính kèm tri thức hệ thống vào vị trí đầu tiên
            if (session.getMessages().isEmpty()) {
                String systemContext = "Bạn là trợ lý ảo hỗ trợ khách hàng của Hệ thống Quản lý Sân bóng PitchSyn. " +
                        "Nhiệm vụ của bạn là giải đáp thắc mắc dựa trên các thông tin sau: " +
                        "- Hệ thống có 3 loại sân chính: Sân 5 người, Sân 7 người và Sân 11 người. " +
                        "- Cách tính điểm trust_score" +
                        "- Quy trình thanh toán tiền sân" +
                        "- Quy trình tìm kiếm đối thủ hoặc cầu đá thuê" +
                        "- Khung giờ hoạt động: Từ 06:00 đến 23:30 hàng ngày. " +
                        "- Chính sách hủy sân: Hủy trước 24 giờ được hoàn 100% tiền cọc. Hủy trước 12 giờ hoàn 50%. Hủy sát giờ không được hoàn tiền. " +
                        "- Dịch vụ đi kèm: Miễn phí trà đá, nước và áo bíp. " +
                        "- Địa chỉ các sân cơ bản: Sân Mỹ Đình nằm ở Nam Từ Liêm, Sân Bách Khoa nằm ở Hai Bà Trưng, Sân Dĩ An nằm ở Bình Dương. " +
                        "Yêu cầu giao tiếp: Trả lời ngắn gọn, lịch sự, chuyên nghiệp. Không tự bịa đặt thông tin ngoài tài liệu được cung cấp.";
                session.getMessages().add(new ChatSession.MessageNode("system", systemContext));
            }

            // 3. Cập nhật thông điệp mới của người dùng vào mảng lịch sử
            session.getMessages().add(new ChatSession.MessageNode("user", request.getMessage()));

            // 4. Xây dựng Payload truyền tải
            ObjectNode requestBodyNode = objectMapper.createObjectNode();
            requestBodyNode.put("model", model);
            ArrayNode messagesArray = requestBodyNode.putArray("messages");

            // Đưa toàn bộ lịch sử hội thoại vào Payload gửi lên Groq
            for (ChatSession.MessageNode msg : session.getMessages()) {
                ObjectNode msgNode = messagesArray.addObject();
                msgNode.put("role", msg.getRole());
                msgNode.put("content", msg.getContent());
            }
            requestBodyNode.put("temperature", 0.5);

            String requestBody = objectMapper.writeValueAsString(requestBodyNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            // 5. Gửi yêu cầu và tiếp nhận phản hồi
            String response = restTemplate.postForObject(apiUrl, requestEntity, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            String aiReply = rootNode.path("choices").get(0).path("message").path("content").asText();

            // 6. Lưu trữ thông điệp của hệ thống vào mảng và cập nhật Redis
            session.getMessages().add(new com.example.backend.entity.redis.ChatSession.MessageNode("assistant", aiReply));
            chatSessionRepository.save(session);

            return new ChatResponse(aiReply, currentSessionId);

        } catch (Exception e) {
            log.error("Lỗi hệ thống khi xử lý Chatbot: ", e);
            return new ChatResponse("Hệ thống trợ lý ảo đang bảo trì. Vui lòng thử lại sau.", null);
        }
    }
}