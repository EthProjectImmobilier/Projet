package com.propertyservice.propertyservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class ReorderImagesRequest {
    private List<Long> imageIds;
}
