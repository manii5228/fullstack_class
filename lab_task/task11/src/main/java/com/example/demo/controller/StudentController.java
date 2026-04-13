package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Student;
import com.example.demo.service.StudentService;

@RestController
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping("/department/{dept}")
    public List<Student> getByDepartment(@PathVariable String dept){
        return service.getStudentByDepartment(dept);
    }

    @GetMapping("/age/{age}")
    public List<Student> getByAge(@PathVariable int age){
        return service.getStudentByAge(age);
    }

    @GetMapping("/StudentsWhichAreGreaterThanAge/{age}")
    public List<Student> getStudentGreaterThan(@PathVariable int age){
        return service.getStudentGreaterThan(age);
    }

    @GetMapping("/department/{dept}/age/{age}")
    public List<Student> getByAgeAndDepartment(@PathVariable String dept,@PathVariable int age){
        return service.getByDepartmentAndAge(dept, age);
    }
}
