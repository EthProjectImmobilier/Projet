package com.propertyservice.propertyservice.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BlockDatesRequest {
    private List<LocalDate> dates;

    public List<LocalDate> getDates() {
        return dates;
    }
}
