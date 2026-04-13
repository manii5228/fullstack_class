package com.example.demo.controller;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.model.Student;
import com.example.demo.service.StudentService;
@RestController //for the rest api it automatically returns the json or xml body
@RequestMapping("/students")
public class StudentController {
	private final StudentService service;

	public StudentController(StudentService service) {
		this.service = service;
	}
	@PostMapping  //to insert data
	public Student createStudent(@RequestBody Student student) {
		return service.savestudent(student);
	}
	@GetMapping //to receive the data
	public List<Student> getAllStudents(){
		return service.getAllStudent();
	}
	@GetMapping("/{id}")
	public Student getStudent(@PathVariable int id) {//at pathvariable is used to retrive data from url 
		return service.getStudentById(id);
	}
	@PutMapping("/{id}")
	public Student updateStudent(@PathVariable int id,@RequestBody Student student) {
		student.setId(id);
		return service.updateStudent(student);
	}
	@DeleteMapping("/{id}") //to delete the data
	public String deleteStudent(@PathVariable int id) {
		service.deleteStudent(id);
		return "Student deleted Successfully";
	}
}
