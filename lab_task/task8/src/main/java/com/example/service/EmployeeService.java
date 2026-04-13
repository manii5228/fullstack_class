package com.example.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.employeerepository.EmployeeRepository;
import com.example.model.Employee;

@Component
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public void createEmployee(int id, String name, String dept) {
        Employee emp = new Employee(id, name, dept);
        employeeRepository.addEmployee(emp);
    }

    public List<Employee> fetchAllEmployees() {
        return employeeRepository.getAllEmployees();
    }
}
