package com.mentoriasg4.scheduling_service.service;

import com.mentoriasg4.scheduling_service.dto.UserInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${user.service.base-url:http://localhost:8081}")
    private String baseUrl;

    @Value("${internal.service.token}")
    private String internalToken;

    public UserServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public UserInfo getUserById(Long userId) {
        if (userId == null) {
            return null;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Token", internalToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        String url = baseUrl + "/api/users/internal/" + userId;
        try {
            ResponseEntity<UserInfo> response = restTemplate.exchange(url, HttpMethod.GET, entity, UserInfo.class);
            return response.getBody();
        } catch (Exception ex) {
            return null;
        }
    }
}
