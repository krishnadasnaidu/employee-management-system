package com.example.employeemanagement.entity;

/**
 * Represents the employment status of an Employee.
 * Stored in the database as a STRING (see @Enumerated(EnumType.STRING) on Employee.status)
 * so the DB column contains "ACTIVE" / "INACTIVE" / "ON_LEAVE" instead of 0 / 1 / 2.
 * This is important: if you use EnumType.ORDINAL instead, reordering this enum later
 * would silently corrupt existing data.
 */
public enum EmployeeStatus {
    ACTIVE,
    INACTIVE,
    ON_LEAVE
}
