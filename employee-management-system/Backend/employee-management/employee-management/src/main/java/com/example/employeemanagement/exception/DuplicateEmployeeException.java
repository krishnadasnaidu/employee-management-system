package com.example.employeemanagement.exception;

/**
 * Thrown when trying to create/update an employee with an email that already
 * belongs to another employee. Handled in GlobalExceptionHandler and turned
 * into a 409 CONFLICT response.
 */
public class DuplicateEmployeeException extends RuntimeException {

    public DuplicateEmployeeException(String email) {
        super("An employee with email '" + email + "' already exists");
    }
}
