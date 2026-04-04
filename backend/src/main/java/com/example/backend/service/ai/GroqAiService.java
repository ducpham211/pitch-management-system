package com.example.backend.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

    // Record tĩnh để lưu kết quả phân tích
    public record AiAnalysisResult(boolean isToxic, int penaltyScore, String aiReason) {}

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
}