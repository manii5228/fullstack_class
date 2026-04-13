-- Create the database
CREATE DATABASE IF NOT EXISTS event_sync_db;
USE event_sync_db;

-- Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'LEAD', 'EMPLOYEE') DEFAULT 'EMPLOYEE',
    team_id INT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(user_id)
);

-- Tasks table
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    priority_score INT DEFAULT 1,
    deadline DATE,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    assigned_to INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Events table
CREATE TABLE events (
    event_id VARCHAR(36) PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    user_id INT,
    task_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

-- Token blacklist table
CREATE TABLE token_blacklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);