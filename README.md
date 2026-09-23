# Employee Management System

A web-based Employee Management System with a frontend built using HTML, CSS, and JavaScript, and a backend REST API developed using Java and Spring Boot.

## Technologies Used

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- REST API
- H2 Database
- Maven

### Frontend
- HTML5
- CSS3
- JavaScript

### Tools
- Eclipse
- Postman
- Git
- GitHub

## Features

- Add employee
- Add multiple employees
- View employee by ID
- View all employees
- Update employee details
- Partially update employee details
- Delete employee
- Delete all employees

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/emp` | Create an employee |
| POST | `/emps` | Create multiple employees |
| GET | `/emp/{id}` | Get employee by ID |
| GET | `/emps` | Get all employees |
| PUT | `/emp/{id}` | Update employee details |
| PATCH | `/emps/{id}` | Partially update employee details |
| DELETE | `/emps/{id}` | Delete an employee |
| DELETE | `/emps` | Delete all employees |

## Project Architecture

The backend follows a layered architecture:

Frontend
   |
   v
REST Controller
   |
   v
Service Layer
   |
   v
Repository Layer
   |
   v
H2 Database
