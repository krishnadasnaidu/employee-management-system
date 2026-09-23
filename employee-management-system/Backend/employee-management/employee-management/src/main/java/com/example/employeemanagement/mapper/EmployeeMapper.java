package com.example.employeemanagement.mapper;

import com.example.employeemanagement.dto.EmployeeRequestDTO;
import com.example.employeemanagement.dto.EmployeeResponseDTO;
import com.example.employeemanagement.entity.Employee;
import org.springframework.stereotype.Component;

/**
 * Plain, explicit mapper (no MapStruct/ModelMapper magic) so it's easy to read
 * and debug — good for learning and for interviews.
 */
@Component
public class EmployeeMapper {

    public Employee toEntity(EmployeeRequestDTO dto) {
        Employee employee = new Employee();
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setDepartment(dto.getDepartment());
        employee.setSalary(dto.getSalary());
        employee.setDateOfJoining(dto.getDateOfJoining());
        employee.setStatus(dto.getStatus());
        return employee;
    }

    public EmployeeResponseDTO toResponseDTO(Employee employee) {
        return new EmployeeResponseDTO(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getSalary(),
                employee.getDateOfJoining(),
                employee.getStatus()
        );
    }
}
