package com.example.demo.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Student;
import com.example.demo.repository.Studentrepository;
@Service
public class StudentService {
	private final Studentrepository repo;

	public StudentService(Studentrepository repo) {
		this.repo = repo;
	}
	public Student savestudent(Student s) {
		return repo.save(s);
	}
	public List<Student> getAllStudent(){
		return repo.findAll();
	}
	public Student getStudentById(int id) {
		return repo.findById(id).orElse(null);
	}
	public Student updateStudent(Student s) {
		return repo.save(s);
	}
	public void deleteStudent(int id) {
		repo.deleteById(id);
	}
}