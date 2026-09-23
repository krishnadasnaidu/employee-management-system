package com.example.employeemanagement.repository;

import com.example.employeemanagement.entity.Employee;
import com.example.employeemanagement.entity.EmployeeStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long> {

    // =========================================================
    // EMAIL
    // =========================================================

    Optional<Employee> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(
            String email,
            Long id);

    // =========================================================
    // SEARCH
    // =========================================================

    List<Employee> findByDepartmentIgnoreCase(
            String department);

    List<Employee> findByStatus(
            EmployeeStatus status);

    List<Employee> findByLastNameContainingIgnoreCase(
            String lastName);

    // =========================================================
    // PAGINATION
    // =========================================================

    Page<Employee> findAll(Pageable pageable);

    // =========================================================
    // PAGINATION + DEPARTMENT
    // =========================================================

    Page<Employee> findByDepartmentIgnoreCase(
            String department,
            Pageable pageable);

    // =========================================================
    // PAGINATION + STATUS
    // =========================================================

    Page<Employee> findByStatus(
            EmployeeStatus status,
            Pageable pageable);

    // =========================================================
    // PAGINATION + DEPARTMENT + STATUS
    // =========================================================

    Page<Employee> findByDepartmentIgnoreCaseAndStatus(
            String department,
            EmployeeStatus status,
            Pageable pageable);

    // =========================================================
    // PAGINATION + LAST NAME
    // =========================================================

    Page<Employee> findByLastNameContainingIgnoreCase(
            String lastName,
            Pageable pageable);
}