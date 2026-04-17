-- BentoGrid Event Booking System - Database Schema
CREATE DATABASE IF NOT EXISTS eventbooking;
USE eventbooking;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  role ENUM('student', 'faculty', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  description TEXT,
  venue VARCHAR(200),
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  total_tickets INT NOT NULL DEFAULT 100,
  available_tickets INT NOT NULL DEFAULT 100,
  category VARCHAR(50),
  tags JSON,
  poster_url VARCHAR(500),
  status ENUM('active', 'inactive', 'archived', 'full') DEFAULT 'active',
  difficulty_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  ticket_count INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- Waitlist Table
CREATE TABLE IF NOT EXISTS waitlist (
  waitlist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('waiting', 'converted', 'cancelled') DEFAULT 'waiting',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  UNIQUE KEY unique_waitlist (user_id, event_id)
);

-- Event Analytics Table
CREATE TABLE IF NOT EXISTS event_analytics (
  analytics_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL UNIQUE,
  views INT DEFAULT 0,
  bookings INT DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0.00,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default admin (password: admin123)
INSERT IGNORE INTO admins (name, email, password_hash) VALUES 
('Super Admin', 'admin@eventbooking.com', '$2b$10$CwuKEaCiX0Tb4dSiPqAdtuyxQOmByVpss4YAaYPHAfY4Kf3izrXke');

-- Seed sample events
INSERT IGNORE INTO events (title, department, description, venue, event_date, event_time, price, total_tickets, available_tickets, category, tags, status, difficulty_level) VALUES
('TechFest 2024 - AI Workshop', 'Computer Science', 'Explore AI and Machine Learning with hands-on labs covering neural networks, NLP, and computer vision.', 'CS Seminar Hall', '2026-05-15', '10:00:00', 299.00, 50, 42, 'Workshop', '["Technical", "AI", "Advanced"]', 'active', 'Advanced'),
('Cultural Nite 2024', 'Arts & Culture', 'Annual cultural extravaganza featuring music, dance, drama and art exhibitions.', 'Open Air Theatre', '2026-05-20', '17:00:00', 0.00, 200, 178, 'Cultural', '["Cultural", "Beginner", "Fun"]', 'active', 'Beginner'),
('Career Development Seminar', 'Management', 'Industry leaders share insights on career paths, resume building and interview skills.', 'Management Auditorium', '2026-05-10', '09:00:00', 149.00, 100, 23, 'Seminar', '["Seminar", "Career", "Intermediate"]', 'active', 'Intermediate'),
('Hackathon 2024', 'Computer Science', '24-hour coding challenge with prizes worth 1 lakh for top 3 teams.', 'CS Lab Block', '2026-06-01', '08:00:00', 199.00, 60, 5, 'Workshop', '["Technical", "Hackathon", "Advanced"]', 'active', 'Advanced'),
('Photography Exhibition', 'Arts & Culture', 'Student photography showcase with themes of nature, urban life and abstract art.', 'Art Gallery Hall', '2026-05-25', '11:00:00', 0.00, 150, 150, 'Cultural', '["Cultural", "Art", "Beginner"]', 'active', 'Beginner'),
('Data Science Bootcamp', 'Computer Science', 'Intensive 2-day bootcamp covering Python, Pandas, visualization and ML basics.', 'CS Seminar Hall', '2026-06-10', '09:00:00', 499.00, 40, 31, 'Workshop', '["Technical", "Data Science", "Intermediate"]', 'active', 'Intermediate');

-- Seed analytics for events
INSERT IGNORE INTO event_analytics (event_id, views, bookings, engagement_score) VALUES
(1, 320, 8, 87.5),
(2, 450, 22, 92.0),
(3, 210, 77, 95.3),
(4, 580, 55, 98.7),
(5, 130, 0, 45.0),
(6, 270, 9, 78.4);
