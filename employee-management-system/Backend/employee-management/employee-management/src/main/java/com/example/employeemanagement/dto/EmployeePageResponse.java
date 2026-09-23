package com.example.employeemanagement.dto;

import java.util.List;

public class EmployeePageResponse {

    private List<EmployeeResponseDTO> employees;

    private int currentPage;

    private int pageSize;

    private long totalElements;

    private int totalPages;

    private boolean first;

    private boolean last;

    public EmployeePageResponse() {
    }

    public EmployeePageResponse(
            List<EmployeeResponseDTO> employees,
            int currentPage,
            int pageSize,
            long totalElements,
            int totalPages,
            boolean first,
            boolean last) {

        this.employees = employees;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
    }

    public List<EmployeeResponseDTO> getEmployees() {
        return employees;
    }

    public void setEmployees(List<EmployeeResponseDTO> employees) {
        this.employees = employees;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }
}