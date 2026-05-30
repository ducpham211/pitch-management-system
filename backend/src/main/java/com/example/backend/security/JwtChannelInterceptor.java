package com.example.backend.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String[] chunks = token.split("\\.");
                    if (chunks.length == 3) {
                        String payload = new String(java.util.Base64.getUrlDecoder().decode(chunks[1]));
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode jsonNode = mapper.readTree(payload);

                        String userId = null;
                        if (jsonNode.has("sub")) {
                            userId = jsonNode.get("sub").asText();
                        } else if (jsonNode.has("id")) {
                            userId = jsonNode.get("id").asText();
                        } else if (jsonNode.has("userId")) {
                            userId = jsonNode.get("userId").asText();
                        } else if (jsonNode.has("username")) {
                            userId = jsonNode.get("username").asText();
                        }

                        if (userId != null) {
                            UsernamePasswordAuthenticationToken authentication = 
                                    new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>());
                            accessor.setUser(authentication);
                        }
                    }
                } catch (Exception e) {
                    // Log or ignore authentication failure
                }
            }
        }
        return message;
    }
}
