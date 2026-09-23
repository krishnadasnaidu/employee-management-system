package com.example.employeemanagement.controller;

import com.example.employeemanagement.dto.EmployeePageResponse;
import com.example.employeemanagement.dto.EmployeePatchDTO;
import com.example.employeemanagement.dto.EmployeeRequestDTO;
import com.example.employeemanagement.dto.EmployeeResponseDTO;
import com.example.employeemanagement.entity.Employee;
import com.example.employeemanagement.entity.EmployeeStatus;
import com.example.employeemanagement.mapper.EmployeeMapper;
import com.example.employeemanagement.service.EmployeeService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;


@RestController
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeMapper employeeMapper;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public EmployeeController(
            EmployeeService employeeService,
            EmployeeMapper employeeMapper) {

        this.employeeService = employeeService;
        this.employeeMapper = employeeMapper;
    }


    // =========================================================
    // CREATE EMPLOYEE
    // =========================================================

    // POST /api/employees

    @PostMapping
    public ResponseEntity<EntityModel<EmployeeResponseDTO>> createEmployee(
            @Valid @RequestBody EmployeeRequestDTO requestDTO) {

        Employee saved =
                employeeService.createEmployee(requestDTO);

        EntityModel<EmployeeResponseDTO> body =
                toModel(saved);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(body);
    }


    // =========================================================
    // CREATE EMPLOYEES - BULK
    // =========================================================

    // POST /api/employees/bulk

    @PostMapping("/bulk")
    public ResponseEntity<
            CollectionModel<EntityModel<EmployeeResponseDTO>>> createEmployees(
            @Valid @RequestBody List<
                    @Valid EmployeeRequestDTO> requestDTOs) {

        List<Employee> saved =
                employeeService.createEmployees(requestDTOs);

        List<EntityModel<EmployeeResponseDTO>> models =
                saved.stream()
                        .map(this::toModel)
                        .toList();

        CollectionModel<EntityModel<EmployeeResponseDTO>> collection =
                CollectionModel.of(
                        models,
                        linkTo(
                                methodOn(EmployeeController.class)
                                        .getAllEmployees(
                                                0,
                                                10,
                                                "id",
                                                "asc",
                                                null,
                                                null,
                                                null
                                        )
                        ).withRel("all-employees")
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(collection);
    }


    // =========================================================
    // GET EMPLOYEE BY ID
    // =========================================================

    // GET /api/employees/{id}

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<EmployeeResponseDTO>> getEmployeeById(
            @PathVariable Long id) {

        Employee employee =
                employeeService.getEmployeeById(id);

        return ResponseEntity.ok(
                toModel(employee)
        );
    }


    // =========================================================
    // GET ALL
    // PAGINATION + SORTING + FILTERING
    // =========================================================

    /*
     * GET /api/employees
     *
     * Default:
     * page = 0
     * size = 10
     * sort = id
     * direction = asc
     *
     * Optional filters:
     * department
     * status
     * lastName
     *
     * Examples:
     *
     * GET /api/employees
     *
     * GET /api/employees?page=0&size=5
     *
     * GET /api/employees?page=0&size=10&department=IT
     *
     * GET /api/employees?page=0&size=10&status=ACTIVE
     *
     * GET /api/employees?page=0&size=10&lastName=Sharma
     *
     * GET /api/employees?page=0&size=10&department=IT&status=ACTIVE
     *
     * GET /api/employees?page=0&size=10&sort=salary&direction=desc
     */

    @GetMapping
    public ResponseEntity<EmployeePageResponse> getAllEmployees(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "id")
            String sort,

            @RequestParam(defaultValue = "asc")
            String direction,

            @RequestParam(required = false)
            String department,

            @RequestParam(required = false)
            EmployeeStatus status,

            @RequestParam(required = false)
            String lastName) {


        // =====================================================
        // VALIDATE PAGE
        // =====================================================

        if (page < 0) {
            page = 0;
        }


        // =====================================================
        // VALIDATE SIZE
        // =====================================================

        if (size < 1) {
            size = 10;
        }

        if (size > 100) {
            size = 100;
        }


        // =====================================================
        // VALIDATE SORT FIELD
        // =====================================================

        List<String> allowedSortFields = List.of(
                "id",
                "firstName",
                "lastName",
                "email",
                "department",
                "salary",
                "dateOfJoining",
                "status"
        );

        if (!allowedSortFields.contains(sort)) {
            sort = "id";
        }


        // =====================================================
        // SORT DIRECTION
        // =====================================================

        Sort.Direction sortDirection;

        if (direction.equalsIgnoreCase("desc")) {

            sortDirection = Sort.Direction.DESC;
            direction = "desc";

        } else {

            sortDirection = Sort.Direction.ASC;
            direction = "asc";
        }


        // =====================================================
        // CREATE PAGEABLE
        // =====================================================

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(sortDirection, sort)
                );


        // =====================================================
        // GET DATA
        // =====================================================

        Page<Employee> employeePage;


        // -----------------------------------------------------
        // DEPARTMENT + STATUS
        // -----------------------------------------------------

        if (department != null
                && !department.isBlank()
                && status != null) {

            employeePage =
                    employeeService
                            .getEmployeesByDepartmentAndStatus(
                                    department,
                                    status,
                                    pageable
                            );
        }


        // -----------------------------------------------------
        // DEPARTMENT ONLY
        // -----------------------------------------------------

        else if (department != null
                && !department.isBlank()) {

            employeePage =
                    employeeService
                            .getEmployeesByDepartment(
                                    department,
                                    pageable
                            );
        }


        // -----------------------------------------------------
        // STATUS ONLY
        // -----------------------------------------------------

        else if (status != null) {

            employeePage =
                    employeeService
                            .getEmployeesByStatus(
                                    status,
                                    pageable
                            );
        }


        // -----------------------------------------------------
        // LAST NAME ONLY
        // -----------------------------------------------------

        else if (lastName != null
                && !lastName.isBlank()) {

            employeePage =
                    employeeService
                            .searchEmployeesByLastName(
                                    lastName,
                                    pageable
                            );
        }


        // -----------------------------------------------------
        // NO FILTER
        // -----------------------------------------------------

        else {

            employeePage =
                    employeeService.getEmployees(pageable);
        }


        // =====================================================
        // CONVERT EMPLOYEE -> DTO
        // =====================================================

        List<EmployeeResponseDTO> employees =
                employeePage.getContent()
                        .stream()
                        .map(employeeMapper::toResponseDTO)
                        .toList();


        // =====================================================
        // CREATE PAGINATION RESPONSE
        // =====================================================

        EmployeePageResponse response =
                new EmployeePageResponse(
                        employees,
                        employeePage.getNumber(),
                        employeePage.getSize(),
                        employeePage.getTotalElements(),
                        employeePage.getTotalPages(),
                        employeePage.isFirst(),
                        employeePage.isLast()
                );


        return ResponseEntity.ok(response);
    }


    // =========================================================
    // SEARCH BY DEPARTMENT - OLD ENDPOINT
    // =========================================================

    // GET /api/employees/search/department?department=IT

    @GetMapping("/search/department")
    public ResponseEntity<
            CollectionModel<EntityModel<EmployeeResponseDTO>>> getByDepartment(
            @RequestParam String department) {

        List<Employee> employees =
                employeeService.getEmployeesByDepartment(
                        department
                );

        return ResponseEntity.ok(
                wrapCollection(employees)
        );
    }


    // =========================================================
    // SEARCH BY STATUS - OLD ENDPOINT
    // =========================================================

    // GET /api/employees/search/status?status=ACTIVE

    @GetMapping("/search/status")
    public ResponseEntity<
            CollectionModel<EntityModel<EmployeeResponseDTO>>> getByStatus(
            @RequestParam EmployeeStatus status) {

        List<Employee> employees =
                employeeService.getEmployeesByStatus(status);

        return ResponseEntity.ok(
                wrapCollection(employees)
        );
    }


    // =========================================================
    // SEARCH BY LAST NAME - OLD ENDPOINT
    // =========================================================

    // GET /api/employees/search/lastname?lastName=Sharma

    @GetMapping("/search/lastname")
    public ResponseEntity<
            CollectionModel<EntityModel<EmployeeResponseDTO>>> searchByLastName(
            @RequestParam String lastName) {

        List<Employee> employees =
                employeeService.searchEmployeesByLastName(
                        lastName
                );

        return ResponseEntity.ok(
                wrapCollection(employees)
        );
    }


    // =========================================================
    // UPDATE - PUT
    // =========================================================

    // PUT /api/employees/{id}

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<EmployeeResponseDTO>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequestDTO requestDTO) {

        Employee updated =
                employeeService.updateEmployee(
                        id,
                        requestDTO
                );

        return ResponseEntity.ok(
                toModel(updated)
        );
    }


    // =========================================================
    // UPDATE - PATCH
    // =========================================================

    // PATCH /api/employees/{id}

    @PatchMapping("/{id}")
    public ResponseEntity<EntityModel<EmployeeResponseDTO>> patchEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeePatchDTO patchDTO) {

        Employee patched =
                employeeService.patchEmployee(
                        id,
                        patchDTO
                );

        return ResponseEntity.ok(
                toModel(patched)
        );
    }


    // =========================================================
    // DELETE EMPLOYEE
    // =========================================================

    // DELETE /api/employees/{id}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // DELETE ALL
    // =========================================================

    // DELETE /api/employees

    @DeleteMapping
    public ResponseEntity<Void> deleteAllEmployees() {

        employeeService.deleteAllEmployees();

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // HATEOAS ENTITY MODEL
    // =========================================================

    private EntityModel<EmployeeResponseDTO> toModel(
            Employee employee) {

        EmployeeResponseDTO dto =
                employeeMapper.toResponseDTO(employee);

        return EntityModel.of(
                dto,

                // -------------------------------------------------
                // SELF
                // -------------------------------------------------

                linkTo(
                        methodOn(EmployeeController.class)
                                .getEmployeeById(
                                        employee.getId()
                                )
                ).withSelfRel(),


                // -------------------------------------------------
                // ALL EMPLOYEES
                // -------------------------------------------------

                linkTo(
                        methodOn(EmployeeController.class)
                                .getAllEmployees(
                                        0,
                                        10,
                                        "id",
                                        "asc",
                                        null,
                                        null,
                                        null
                                )
                ).withRel("all-employees"),


                // -------------------------------------------------
                // PUT
                // -------------------------------------------------

                linkTo(
                        methodOn(EmployeeController.class)
                                .updateEmployee(
                                        employee.getId(),
                                        null
                                )
                ).withRel("update"),


                // -------------------------------------------------
                // PATCH
                // -------------------------------------------------

                linkTo(
                        methodOn(EmployeeController.class)
                                .patchEmployee(
                                        employee.getId(),
                                        null
                                )
                ).withRel("patch"),


                // -------------------------------------------------
                // DELETE
                // -------------------------------------------------

                linkTo(
                        methodOn(EmployeeController.class)
                                .deleteEmployee(
                                        employee.getId()
                                )
                ).withRel("delete")
        );
    }


    // =========================================================
    // COLLECTION HELPER
    // =========================================================

    private CollectionModel<EntityModel<EmployeeResponseDTO>>
    wrapCollection(List<Employee> employees) {

        List<EntityModel<EmployeeResponseDTO>> models =
                employees.stream()
                        .map(this::toModel)
                        .toList();

        return CollectionModel.of(
                models,

                linkTo(
                        methodOn(EmployeeController.class)
                                .getAllEmployees(
                                        0,
                                        10,
                                        "id",
                                        "asc",
                                        null,
                                        null,
                                        null
                                )
                ).withRel("all-employees")
        );
    }
}