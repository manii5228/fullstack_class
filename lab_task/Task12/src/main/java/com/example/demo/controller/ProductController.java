package com.example.demo.controller;



import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.Product;
import com.example.demo.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService service;

    // GET ALL
    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Product getProduct(@PathVariable int id) {
        return service.getProductById(id);
    }

    // POST
    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return service.addProduct(product);
    }

    // PUT
    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable int id,
                                 @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable int id) {
        service.deleteProduct(id);
        return "Product deleted successfully";
    }
}