package com.example.employeemanagement.service.impl;

import com.example.employeemanagement.dto.EmployeePatchDTO;
import com.example.employeemanagement.dto.EmployeeRequestDTO;
import com.example.employeemanagement.entity.Employee;
import com.example.employeemanagement.entity.EmployeeStatus;
import com.example.employeemanagement.exception.DuplicateEmployeeException;
import com.example.employeemanagement.exception.EmployeeNotFoundException;
import com.example.employeemanagement.mapper.EmployeeMapper;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.EmployeeService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    // Constructor injection
    public EmployeeServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeMapper employeeMapper) {

        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
    }

    // =========================================================
    // CREATE EMPLOYEE
    // =========================================================

    @Override
    public Employee createEmployee(EmployeeRequestDTO requestDTO) {

        if (employeeRepository.existsByEmailIgnoreCase(
                requestDTO.getEmail())) {

            throw new DuplicateEmployeeException(
                    requestDTO.getEmail());
        }

        Employee employee =
                employeeMapper.toEntity(requestDTO);

        return employeeRepository.save(employee);
    }

    // =========================================================
    // CREATE EMPLOYEES - BULK
    // =========================================================

    @Override
    public List<Employee> createEmployees(
            List<EmployeeRequestDTO> requestDTOs) {

        for (EmployeeRequestDTO dto : requestDTOs) {

            if (employeeRepository.existsByEmailIgnoreCase(
                    dto.getEmail())) {

                throw new DuplicateEmployeeException(
                        dto.getEmail());
            }
        }

        List<Employee> employees =
                requestDTOs.stream()
                        .map(employeeMapper::toEntity)
                        .toList();

        return employeeRepository.saveAll(employees);
    }

    // =========================================================
    // GET EMPLOYEE BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {

        return employeeRepository.findById(id)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(id));
    }

    // =========================================================
    // GET ALL EMPLOYEES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {

        return employeeRepository.findAll();
    }

    // =========================================================
    // GET EMPLOYEES - PAGINATION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<Employee> getEmployees(Pageable pageable) {

        return employeeRepository.findAll(pageable);
    }

    // =========================================================
    // UPDATE EMPLOYEE - PUT
    // =========================================================

    @Override
    public Employee updateEmployee(
            Long id,
            EmployeeRequestDTO requestDTO) {

        Employee existing =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new EmployeeNotFoundException(id));

        // Check whether another employee
        // already has this email
        if (employeeRepository.existsByEmailIgnoreCaseAndIdNot(
                requestDTO.getEmail(),
                id)) {

            throw new DuplicateEmployeeException(
                    requestDTO.getEmail());
        }

        existing.setFirstName(requestDTO.getFirstName());
        existing.setLastName(requestDTO.getLastName());
        existing.setEmail(requestDTO.getEmail());
        existing.setDepartment(requestDTO.getDepartment());
        existing.setSalary(requestDTO.getSalary());
        existing.setDateOfJoining(requestDTO.getDateOfJoining());
        existing.setStatus(requestDTO.getStatus());

        return employeeRepository.save(existing);
    }

    // =========================================================
    // PATCH EMPLOYEE
    // =========================================================

    @Override
    public Employee patchEmployee(
            Long id,
            EmployeePatchDTO patchDTO) {

        Employee existing =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new EmployeeNotFoundException(id));

        if (patchDTO.getFirstName() != null) {

            existing.setFirstName(
                    patchDTO.getFirstName());
        }

        if (patchDTO.getLastName() != null) {

            existing.setLastName(
                    patchDTO.getLastName());
        }

        if (patchDTO.getEmail() != null) {

            if (employeeRepository
                    .existsByEmailIgnoreCaseAndIdNot(
                            patchDTO.getEmail(),
                            id)) {

                throw new DuplicateEmployeeException(
                        patchDTO.getEmail());
            }

            existing.setEmail(
                    patchDTO.getEmail());
        }

        if (patchDTO.getDepartment() != null) {

            existing.setDepartment(
                    patchDTO.getDepartment());
        }

        if (patchDTO.getSalary() != null) {

            existing.setSalary(
                    patchDTO.getSalary());
        }

        if (patchDTO.getDateOfJoining() != null) {

            existing.setDateOfJoining(
                    patchDTO.getDateOfJoining());
        }

        if (patchDTO.getStatus() != null) {

            existing.setStatus(
                    patchDTO.getStatus());
        }

        return employeeRepository.save(existing);
    }

    // =========================================================
    // DELETE EMPLOYEE
    // =========================================================

    @Override
    public void deleteEmployee(Long id) {

        if (!employeeRepository.existsById(id)) {

            throw new EmployeeNotFoundException(id);
        }

        employeeRepository.deleteById(id);
    }

    // =========================================================
    // DELETE ALL EMPLOYEES
    // =========================================================

    @Override
    public void deleteAllEmployees() {

        employeeRepository.deleteAll();
    }

    // =========================================================
    // SEARCH BY DEPARTMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Employee> getEmployeesByDepartment(
            String department) {

        return employeeRepository
                .findByDepartmentIgnoreCase(
                        department);
    }

    // =========================================================
    // SEARCH BY STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Employee> getEmployeesByStatus(
            EmployeeStatus status) {

        return employeeRepository
                .findByStatus(status);
    }

    // =========================================================
    // SEARCH BY LAST NAME
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Employee> searchEmployeesByLastName(
            String lastName) {

        return employeeRepository
                .findByLastNameContainingIgnoreCase(
                        lastName);
    }

    // =========================================================
    // PAGINATED SEARCH BY DEPARTMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<Employee> getEmployeesByDepartment(
            String department,
            Pageable pageable) {

        return employeeRepository
                .findByDepartmentIgnoreCase(
                        department,
                        pageable);
    }

    // =========================================================
    // PAGINATED SEARCH BY STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<Employee> getEmployeesByStatus(
            EmployeeStatus status,
            Pageable pageable) {

        return employeeRepository
                .findByStatus(
                        status,
                        pageable);
    }

    // =========================================================
    // PAGINATED SEARCH BY DEPARTMENT + STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<Employee> getEmployeesByDepartmentAndStatus(
            String department,
            EmployeeStatus status,
            Pageable pageable) {

        return employeeRepository
                .findByDepartmentIgnoreCaseAndStatus(
                        department,
                        status,
                        pageable);
    }

    // =========================================================
    // PAGINATED SEARCH BY LAST NAME
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<Employee> searchEmployeesByLastName(
            String lastName,
            Pageable pageable) {

        return employeeRepository
                .findByLastNameContainingIgnoreCase(
                        lastName,
                        pageable);
    }
}