CREATE DATABASE logging_system;
USE logging_system;
CREATE TABLE Transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    account_name VARCHAR(100),
    amount DECIMAL(10,2),
    transaction_type VARCHAR(20),  -- CREDIT / DEBIT
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Activity_Log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    action_type VARCHAR(20),  -- INSERT / UPDATE
    transaction_id INT,
    account_name VARCHAR(100),
    amount DECIMAL(10,2),
    action_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELIMITER //

CREATE TRIGGER after_transaction_insert
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
    INSERT INTO Activity_Log (action_type, transaction_id, account_name, amount)
    VALUES ('INSERT', NEW.transaction_id, NEW.account_name, NEW.amount);
END //

DELIMITER ;



CREATE TRIGGER after_transaction_update
AFTER UPDATE ON Transactions
FOR EACH ROW
BEGIN
    INSERT INTO Activity_Log (action_type, transaction_id, account_name, amount)
    VALUES ('UPDATE', NEW.transaction_id, NEW.account_name, NEW.amount)
END //

DELIMITER ;
INSERT INTO Transactions (account_name, amount, transaction_type)
VALUES ('Ravi', 2000, 'DEBIT');
UPDATE Transactions
SET amount = 2500
WHERE transaction_id = 1;
SELECT * FROM Activity_Log;
CREATE VIEW Daily_Activity_Report AS
SELECT 
    DATE(action_time) AS activity_date,
    COUNT(*) AS total_actions,
    SUM(amount) AS total_amount
FROM Activity_Log
GROUP BY DATE(action_time)
ORDER BY activity_date DESC;

SELECT * FROM Daily_Activity_Report;
