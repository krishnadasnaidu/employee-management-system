package com.example.employeemanagement.exception;

/**
 * Thrown when an employee is looked up by ID (or another key) and doesn't exist.
 * Handled in GlobalExceptionHandler and turned into a 404 NOT_FOUND response.
 */
public class EmployeeNotFoundException extends RuntimeException {

    public EmployeeNotFoundException(Long id) {
        super("Employee not found with id: " + id);
    }

    public EmployeeNotFoundException(String message) {
        super(message);
    }
}
