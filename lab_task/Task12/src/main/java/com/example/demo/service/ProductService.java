package com.example.demo.service;


import java.util.*;
import org.springframework.stereotype.Service;
import com.example.demo.model.Product;

@Service
public class ProductService {

    private Map<Integer, Product> productMap = new HashMap<>();

    public ProductService() {
        productMap.put(1, new Product(1, "Pen", 10));
        productMap.put(2, new Product(2, "Notebook", 50));
    }

    // ADD PRODUCT
    public Product addProduct(Product product) {
        productMap.put(product.getId(), product);
        return product;
    }

    // GET ALL
    public List<Product> getAllProducts() {
        return new ArrayList<>(productMap.values());
    }

    // GET BY ID
    public Product getProductById(int id) {
        return productMap.get(id);
    }

    // UPDATE
    public Product updateProduct(int id, Product product) {
        product.setId(id);
        productMap.put(id, product);
        return product;
    }

    // DELETE
    public void deleteProduct(int id) {
        productMap.remove(id);
    }
}