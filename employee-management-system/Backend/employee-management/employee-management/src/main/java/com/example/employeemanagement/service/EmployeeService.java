package com.example.employeemanagement.service;

import com.example.employeemanagement.dto.EmployeePatchDTO;
import com.example.employeemanagement.dto.EmployeeRequestDTO;
import com.example.employeemanagement.entity.Employee;
import com.example.employeemanagement.entity.EmployeeStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {

    // =========================
    // CREATE
    // =========================

    Employee createEmployee(EmployeeRequestDTO requestDTO);

    List<Employee> createEmployees(
            List<EmployeeRequestDTO> requestDTOs);

    // =========================
    // GET
    // =========================

    Employee getEmployeeById(Long id);

    List<Employee> getAllEmployees();

    // =========================
    // GET - PAGINATION
    // =========================

    Page<Employee> getEmployees(Pageable pageable);

    // =========================
    // SEARCH
    // =========================

    List<Employee> getEmployeesByDepartment(
            String department);

    List<Employee> getEmployeesByStatus(
            EmployeeStatus status);

    List<Employee> searchEmployeesByLastName(
            String lastName);

    // =========================
    // SEARCH - PAGINATION
    // =========================

    Page<Employee> getEmployeesByDepartment(
            String department,
            Pageable pageable);

    Page<Employee> getEmployeesByStatus(
            EmployeeStatus status,
            Pageable pageable);

    Page<Employee> getEmployeesByDepartmentAndStatus(
            String department,
            EmployeeStatus status,
            Pageable pageable);

    Page<Employee> searchEmployeesByLastName(
            String lastName,
            Pageable pageable);

    // =========================
    // UPDATE
    // =========================

    Employee updateEmployee(
            Long id,
            EmployeeRequestDTO requestDTO);

    Employee patchEmployee(
            Long id,
            EmployeePatchDTO patchDTO);

    // =========================
    // DELETE
    // =========================

    void deleteEmployee(Long id);

    void deleteAllEmployees();
}