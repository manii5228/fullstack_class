package com.example.demo.repository;

import java.util.Map;

import org.springframework.stereotype.Component;

import com.example.demo.Employee;

@Component
public class EmployeeRepository {

    private final Map<Integer, Employee> store = Map.of(
            101, new Employee(101, "Anand", "CSE"),
            102, new Employee(102, "Kiran", "ECE"),
            103, new Employee(103, "Ravi", "IT")
    );

    public Employee findById(int id) {
        return store.get(id);
    }
}
