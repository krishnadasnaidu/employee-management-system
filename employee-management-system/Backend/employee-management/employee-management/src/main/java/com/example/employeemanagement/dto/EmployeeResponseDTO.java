package com.example.employeemanagement.dto;

import com.example.employeemanagement.entity.EmployeeStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;

/**
 * What we actually send back to the client.
 * This is a PLAIN POJO on purpose - it does NOT extend RepresentationModel.
 * The controller wraps it in EntityModel<EmployeeResponseDTO> (for a single
 * employee) or CollectionModel<EntityModel<EmployeeResponseDTO>> (for a list),
 * and THAT wrapper is what adds the "_links" field in the JSON response.
 * If this class also extended RepresentationModel, both it and the wrapper
 * would try to own a "_links" property and Jackson serialization would break.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private Double salary;
    private LocalDate dateOfJoining;
    private EmployeeStatus status;

    public EmployeeResponseDTO() {
    }

    public EmployeeResponseDTO(Long id, String firstName, String lastName, String email,
                                String department, Double salary, LocalDate dateOfJoining,
                                EmployeeStatus status) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.salary = salary;
        this.dateOfJoining = dateOfJoining;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
