package employee.em_task8_fs;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import com.example.config.AppConfig;
import com.example.service.EmployeeService;

public class App {
    public static void main(String[] args) {

        BeanFactory factory = new AnnotationConfigApplicationContext(AppConfig.class);

        EmployeeService service = factory.getBean(EmployeeService.class);

        service.createEmployee(101, "Raha", "CSE");
        service.createEmployee(102, "Kiran", "ECE");
        service.createEmployee(103, "Arun", "IT");

        service.fetchAllEmployees().forEach(System.out::println);
    }
}
