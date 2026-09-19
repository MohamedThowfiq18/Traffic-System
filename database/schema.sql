-- MySQL Database Schema for AI Smart Traffic Police Assistant
CREATE DATABASE IF NOT EXISTS traffic_police_db;
USE traffic_police_db;

-- 1. Owners Table
CREATE TABLE IF NOT EXISTS owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_status VARCHAR(20) DEFAULT 'VALID', -- VALID, EXPIRED, SUSPENDED
    contact_number VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    owner_id INT,
    model VARCHAR(50) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    color VARCHAR(30),
    insurance_status VARCHAR(20) DEFAULT 'VALID', -- VALID, EXPIRED
    insurance_expiry DATE NOT NULL,
    puc_status VARCHAR(20) DEFAULT 'VALID', -- VALID, EXPIRED
    puc_expiry DATE NOT NULL,
    road_tax_status VARCHAR(20) DEFAULT 'VALID', -- VALID, EXPIRED
    road_tax_expiry DATE NOT NULL,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    is_stolen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE SET NULL
);

-- 3. Challans Table (Traffic Tickets)
CREATE TABLE IF NOT EXISTS challans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_plate VARCHAR(20) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    violation_type VARCHAR(100) NOT NULL, -- e.g., 'No Helmet', 'Speeding', 'Triple Riding'
    fine_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_plate) REFERENCES vehicles(license_plate) ON DELETE CASCADE
);

-- Insert Sample Data
INSERT INTO owners (name, license_number, license_status, contact_number, address) VALUES
('Ramesh Kumar', 'DL-1420210098765', 'VALID', '+91 9876543210', '12 Bank Street, Karol Bagh, New Delhi'),
('Anita Sharma', 'MH-1220190045612', 'EXPIRED', '+91 8765432109', '45 Park Avenue, Pune, Maharashtra'),
('Vikram Singh', 'KA-5120150033221', 'SUSPENDED', '+91 7654321098', '89 Electronic City, Bengaluru, Karnataka'),
('Rahul Mehta', 'DL-3C20230001234', 'VALID', '+91 9988776655', 'Sector 15, Dwarka, New Delhi');

INSERT INTO vehicles (license_plate, owner_id, model, brand, color, insurance_status, insurance_expiry, puc_status, puc_expiry, road_tax_status, road_tax_expiry, is_blacklisted, is_stolen) VALUES
('TN 38 AB 1234', 1, 'Splendor Plus', 'Hero', 'Black-Red', 'VALID', '2027-03-12', 'EXPIRED', '2026-06-15', 'VALID', '2028-10-20', FALSE, FALSE),
('DL 3C AM 5678', 2, 'Pulsar 150', 'Bajaj', 'Blue', 'EXPIRED', '2026-04-10', 'VALID', '2026-09-30', 'VALID', '2027-12-15', FALSE, FALSE),
('KA 51 MB 9999', 3, 'Activa 6G', 'Honda', 'White', 'VALID', '2026-11-25', 'EXPIRED', '2026-05-18', 'EXPIRED', '2026-02-10', TRUE, FALSE),
('MH 12 QP 4321', 4, 'Duke 390', 'KTM', 'Orange', 'VALID', '2027-08-30', 'VALID', '2026-12-12', 'VALID', '2029-05-05', FALSE, FALSE);

INSERT INTO challans (vehicle_plate, owner_name, violation_type, fine_amount, status) VALUES
('TN 38 AB 1234', 'Ramesh Kumar', 'PUC Expired', 1000.00, 'PENDING'),
('TN 38 AB 1234', 'Ramesh Kumar', 'No Helmet', 500.00, 'PENDING'),
('KA 51 MB 9999', 'Vikram Singh', 'Riding Without License', 5000.00, 'PENDING');
