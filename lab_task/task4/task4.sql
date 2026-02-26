CREATE DATABASE shop_db;
USE shop_db;
CREATE TABLE Customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100),
    city VARCHAR(100)
);
CREATE TABLE Products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100),
    price DECIMAL(10,2)
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    product_id INT,
    quantity INT,
    order_date DATE,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);
INSERT INTO Customers (name, email, city) VALUES
('Ravi', 'ravi@gmail.com', 'Chennai'),
('Priya', 'priya@gmail.com', 'Bangalore'),
('Arjun', 'arjun@gmail.com', 'Hyderabad');
INSERT INTO Products (product_name, price) VALUES
('Laptop', 50000),
('Mobile', 20000),
('Headphones', 2000);
INSERT INTO Orders (customer_id, product_id, quantity, order_date) VALUES
(1, 1, 1, '2025-01-01'),
(1, 3, 2, '2025-01-05'),
(2, 2, 1, '2025-01-10'),
(3, 3, 5, '2025-01-15'),
(2, 1, 1, '2025-01-20');


SELECT 
    c.name AS Customer,
    p.product_name AS Product,
    o.quantity,
    (p.price * o.quantity) AS Total_Amount,
    o.order_date
FROM Orders o
JOIN Customers c ON o.customer_id = c.customer_id
JOIN Products p ON o.product_id = p.product_id
ORDER BY o.order_date DESC;
SELECT *
FROM (
    SELECT 
        o.order_id,
        c.name,
        (p.price * o.quantity) AS Total_Amount
    FROM Orders o
    JOIN Customers c ON o.customer_id = c.customer_id
    JOIN Products p ON o.product_id = p.product_id
) AS OrderTotals
WHERE Total_Amount = (
    SELECT MAX(p.price * o.quantity)
    FROM Orders o
    JOIN Products p ON o.product_id = p.product_id
);
SELECT name, total_orders
FROM (
    SELECT 
        c.name,
        COUNT(o.order_id) AS total_orders
    FROM Customers c
    JOIN Orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id
) AS CustomerOrders
WHERE total_orders = (
    SELECT MAX(order_count)
    FROM (
        SELECT COUNT(order_id) AS order_count
        FROM Orders
        GROUP BY customer_id
    ) AS OrderCounts
);