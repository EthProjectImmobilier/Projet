package com.propertyservice.propertyservice.dto;

import lombok.Data;

@Data
public class AddImageRequest {
    private String imageUrl;
    private String caption;
}
