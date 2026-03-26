-- Database Schema for Real-Time Event Sync Engine

CREATE DATABASE IF NOT EXISTS event_sync;
USE event_sync;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
    category ENUM('System', 'User', 'IoT') DEFAULT 'User',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123 hashed)
INSERT INTO users (username, password, role) VALUES ('admin', '$2b$10$example.hash.here', 'admin') ON DUPLICATE KEY UPDATE username=username;