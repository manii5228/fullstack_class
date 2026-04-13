package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Student;
import com.example.demo.repository.StudentRepository;
@Service
public class StudentService {
	private final StudentRepository repo;

	public StudentService(StudentRepository repo) {
		this.repo = repo;
	}
	public List<Student> getStudentByDepartment(String dept){
		return repo.findByDepartment(dept);
	}
	public List<Student> getStudentByAge(int age){
		return repo.findByAge(age);
	}
	public List<Student> getStudentGreaterThan(int age){
		return repo.findByAgeGreaterThan(age);
	}
	public List<Student> getByDepartmentAndAge(String dept,int age){
		return repo.findByDepartmentAndAge(dept, age);
	}
}
