# Employee Management REST API

Spring Boot 3.3.4 + Java 17 + Spring Web + Spring Data JPA + H2 + Jakarta Validation + HATEOAS.

## How to run

```bash
mvn clean install
mvn spring-boot:run
```

App starts on **http://localhost:8080**
H2 console: **http://localhost:8080/h2-console**
JDBC URL: `jdbc:h2:mem:employeedb`, user `sa`, empty password.

## Project structure

```
com.example.employeemanagement
├── EmployeeManagementApplication.java   (main class)
├── entity/
│   ├── Employee.java                    (JPA entity)
│   └── EmployeeStatus.java              (enum: ACTIVE, INACTIVE, ON_LEAVE)
├── dto/
│   ├── EmployeeRequestDTO.java          (POST/PUT body - fully validated)
│   ├── EmployeePatchDTO.java            (PATCH body - all fields optional)
│   └── EmployeeResponseDTO.java         (what the API returns)
├── mapper/
│   └── EmployeeMapper.java              (Entity <-> DTO conversion)
├── repository/
│   └── EmployeeRepository.java          (Spring Data JPA)
├── service/
│   ├── EmployeeService.java             (interface)
│   └── impl/EmployeeServiceImpl.java    (business logic)
├── controller/
│   └── EmployeeController.java          (REST endpoints + HATEOAS)
└── exception/
    ├── EmployeeNotFoundException.java
    ├── DuplicateEmployeeException.java
    ├── ErrorResponse.java
    └── GlobalExceptionHandler.java      (@RestControllerAdvice)
```

## Endpoints

| Method | URL | Description |
|---|---|---|
| POST | `/api/employees` | Create one employee |
| POST | `/api/employees/bulk` | Create multiple employees (JSON array) |
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/{id}` | Get one employee by id |
| GET | `/api/employees/search/department?department=IT` | Filter by department |
| GET | `/api/employees/search/status?status=ACTIVE` | Filter by status |
| GET | `/api/employees/search/lastname?lastName=Sharma` | Search by last name (contains, case-insensitive) |
| PUT | `/api/employees/{id}` | Full update (all fields required) |
| PATCH | `/api/employees/{id}` | Partial update (only send fields to change) |
| DELETE | `/api/employees/{id}` | Delete one employee |
| DELETE | `/api/employees` | Delete all employees |

## Sample requests

**Create an employee**
```bash
curl -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Aditi",
    "lastName": "Sharma",
    "email": "aditi.sharma@example.com",
    "department": "Engineering",
    "salary": 75000,
    "dateOfJoining": "2024-01-15",
    "status": "ACTIVE"
  }'
```

**Create multiple employees**
```bash
curl -X POST http://localhost:8080/api/employees/bulk \
  -H "Content-Type: application/json" \
  -d '[
    { "firstName": "Rahul", "lastName": "Verma", "email": "rahul.verma@example.com", "department": "Sales", "salary": 55000, "dateOfJoining": "2023-06-01", "status": "ACTIVE" },
    { "firstName": "Priya", "lastName": "Nair", "email": "priya.nair@example.com", "department": "HR", "salary": 60000, "dateOfJoining": "2022-11-20", "status": "ON_LEAVE" }
  ]'
```

**Get all employees**
```bash
curl http://localhost:8080/api/employees
```

**Partial update (only salary)**
```bash
curl -X PATCH http://localhost:8080/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{ "salary": 80000 }'
```

**Delete an employee**
```bash
curl -X DELETE http://localhost:8080/api/employees/1
```

## Validation behavior

- Missing/invalid field on POST or PUT → `400 Bad Request` with a `validationErrors` map naming each bad field.
- GET/PUT/PATCH/DELETE on an id that doesn't exist → `404 Not Found`.
- Creating/updating with an email that's already taken by another employee → `409 Conflict`.
- Malformed JSON body → `400 Bad Request`.
- Wrong type in a path variable (e.g. `/api/employees/abc`) → `400 Bad Request`.
- Any other unexpected error → `500 Internal Server Error`.

## Design notes (why things are built this way)

- **Entity has no validation annotations** — validation lives on `EmployeeRequestDTO`/`EmployeePatchDTO` only, since those represent what the client sends over HTTP. The entity is an internal persistence concern.
- **Two separate request DTOs** — `EmployeeRequestDTO` for POST/PUT (all fields required, matches REST semantics of a full replace) and `EmployeePatchDTO` (all fields optional, matches PATCH semantics of partial update).
- **`EmployeeStatus` stored as `EnumType.STRING`** — so the database column holds readable text (`ACTIVE`) instead of a fragile numeric ordinal that breaks if the enum order ever changes.
- **HATEOAS response DTO is a plain POJO**, wrapped in `EntityModel`/`CollectionModel` by the controller — the DTO does NOT itself extend `RepresentationModel`, because doing both causes a duplicate `_links` JSON field.
- **`GlobalExceptionHandler` uses `HandlerMethodValidationException`** (not the older `ConstraintViolationException`) for `@RequestParam`/`@PathVariable` validation failures, because that's the mechanism Spring 6.1+ (Spring Boot 3.2+) actually throws.
