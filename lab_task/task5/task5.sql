CREATE DATABASE payment_simulation;
USE payment_simulation;
CREATE TABLE Accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    account_name VARCHAR(100),
    account_type VARCHAR(20),  -- USER or MERCHANT
    balance DECIMAL(10,2)
);
INSERT INTO Accounts (account_name, account_type, balance) VALUES
('Ravi', 'USER', 5000.00),
('Flipkart', 'MERCHANT', 15000.00);
START TRANSACTION;

UPDATE Accounts
SET balance = balance - 2000
WHERE account_id = 1
AND balance >= 2000;

UPDATE Accounts
SET balance = balance + 2000
WHERE account_id = 2;

COMMIT;
START TRANSACTION;

UPDATE Accounts
SET balance = balance - 2000
WHERE account_id = 1
AND balance >= 2000;

UPDATE Accounts
SET balance = balance + 2000
WHERE account_id = 2;

COMMIT;



ROLLBACK;
SELECT * FROM Accounts;