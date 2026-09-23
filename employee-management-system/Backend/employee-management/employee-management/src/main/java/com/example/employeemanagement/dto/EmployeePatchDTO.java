package com.example.employeemanagement.dto;

import com.example.employeemanagement.entity.EmployeeStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Used for PATCH (partial update) request bodies.
 * Every field is nullable/optional on purpose - the client only sends the fields
 * they actually want to change. In EmployeeServiceImpl.patchEmployee(), only the
 * non-null fields are copied onto the existing entity.
 * Fields still get validated IF they are present (e.g. a supplied email must be a
 * valid email), but @NotNull/@NotBlank are intentionally NOT used here.
 */
public class EmployeePatchDTO {

    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @Email(message = "Email must be a valid email address")
    private String email;

    @Size(min = 2, max = 50, message = "Department must be between 2 and 50 characters")
    private String department;

    @PositiveOrZero(message = "Salary must be zero or a positive number")
    private Double salary;

    @PastOrPresent(message = "Date of joining cannot be in the future")
    private LocalDate dateOfJoining;

    private EmployeeStatus status;

    public EmployeePatchDTO() {
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public LocalDate getDateOfJoining() {
        return dateOfJoining;
    }

    public void setDateOfJoining(LocalDate dateOfJoining) {
        this.dateOfJoining = dateOfJoining;
    }

    public EmployeeStatus getStatus() {
        return status;
    }

    public void setStatus(EmployeeStatus status) {
        this.status = status;
    }
}
