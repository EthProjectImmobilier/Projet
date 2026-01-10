package com.propertyservice.propertyservice.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;


@Data
@Builder
public class SearchResponse {
    private Page<PropertyResponse> properties;
    private Long totalProperties;
    private Integer currentPage;
    private Integer totalPages;
}
