
-- Create roles first
INSERT INTO roles (name, nicename, description) 
VALUES 
  ('king', 'King', 'Master administrator'),
  ('knight', 'Knight', 'Senior technician'),
  ('rook', 'Rook', 'Regular technician'),
  ('trainee', 'Trainee', 'Training technician');

-- Create 10 users with different roles
INSERT INTO profiles (id, email, first_name, last_name, role_id)
VALUES 
  (gen_random_uuid(), 'king1@test.com', 'Arthur', 'Pendragon', (SELECT id FROM roles WHERE name = 'king')),
  (gen_random_uuid(), 'knight1@test.com', 'Lancelot', 'DuLac', (SELECT id FROM roles WHERE name = 'knight')),
  (gen_random_uuid(), 'knight2@test.com', 'Gawain', 'Strong', (SELECT id FROM roles WHERE name = 'knight')),
  (gen_random_uuid(), 'rook1@test.com', 'Percival', 'Young', (SELECT id FROM roles WHERE name = 'rook')),
  (gen_random_uuid(), 'rook2@test.com', 'Tristan', 'Brave', (SELECT id FROM roles WHERE name = 'rook')),
  (gen_random_uuid(), 'rook3@test.com', 'Kay', 'Swift', (SELECT id FROM roles WHERE name = 'rook')),
  (gen_random_uuid(), 'trainee1@test.com', 'Galahad', 'Pure', (SELECT id FROM roles WHERE name = 'trainee')),
  (gen_random_uuid(), 'trainee2@test.com', 'Bedivere', 'Loyal', (SELECT id FROM roles WHERE name = 'trainee')),
  (gen_random_uuid(), 'trainee3@test.com', 'Gareth', 'Noble', (SELECT id FROM roles WHERE name = 'trainee')),
  (gen_random_uuid(), 'trainee4@test.com', 'Gaheris', 'Steady', (SELECT id FROM roles WHERE name = 'trainee'));

-- Create 30 customers
INSERT INTO customers (first_name, last_name, email, phone_number)
SELECT 
  'Customer' || i as first_name,
  'Last' || i as last_name,
  'customer' || i || '@example.com' as email,
  '+1555' || LPAD(i::text, 7, '0') as phone_number
FROM generate_series(1, 30) i;

-- Create service types for work orders
INSERT INTO service_types (name, description, price, duration, status)
VALUES 
  ('Oil Change', 'Standard oil change service', 49.99, 30, 'active'),
  ('Brake Service', 'Brake pad replacement', 199.99, 60, 'active'),
  ('Tire Rotation', 'Rotate and balance tires', 79.99, 45, 'active'),
  ('Engine Tune-up', 'Complete engine tune-up', 299.99, 120, 'active');

-- Create 50 work orders
INSERT INTO work_orders (
  first_name, last_name, email, phone_number,
  vehicle_make, vehicle_model, vehicle_year,
  status, start_time, end_time,
  contact_preference
)
SELECT 
  'Customer' || i,
  'Surname' || i,
  'customer' || i || '@example.com',
  '+1555' || LPAD(i::text, 7, '0'),
  CASE (i % 4) 
    WHEN 0 THEN 'Toyota'
    WHEN 1 THEN 'Honda'
    WHEN 2 THEN 'Ford'
    ELSE 'BMW'
  END,
  CASE (i % 4)
    WHEN 0 THEN 'Camry'
    WHEN 1 THEN 'Civic'
    WHEN 2 THEN 'F-150'
    ELSE '3 Series'
  END,
  2020 + (i % 4),
  CASE (i % 4)
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'in_progress'
    WHEN 2 THEN 'completed'
    ELSE 'cancelled'
  END,
  NOW() + (i || ' days')::interval,
  NOW() + (i || ' days')::interval + '2 hours'::interval,
  'email'
FROM generate_series(1, 50) i;

-- Create 30 estimate requests
INSERT INTO estimate_requests (
  customer_id,
  vehicle_make,
  vehicle_model,
  vehicle_year,
  status,
  description
)
SELECT 
  (SELECT id FROM customers ORDER BY random() LIMIT 1),
  CASE (i % 4) 
    WHEN 0 THEN 'Toyota'
    WHEN 1 THEN 'Honda'
    WHEN 2 THEN 'Ford'
    ELSE 'BMW'
  END,
  CASE (i % 4)
    WHEN 0 THEN 'Camry'
    WHEN 1 THEN 'Civic'
    WHEN 2 THEN 'F-150'
    ELSE '3 Series'
  END,
  2020 + (i % 4),
  CASE (i % 3)
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'estimated'
    ELSE 'accepted'
  END,
  'Quote request description ' || i
FROM generate_series(1, 30) i;

-- Create 33 quotes
INSERT INTO estimates (
  estimate_number,
  customer_first_name,
  customer_last_name,
  customer_email,
  vehicle_make,
  vehicle_model,
  vehicle_year,
  status,
  subtotal,
  total
)
SELECT 
  'EST-2024-' || LPAD(i::text, 4, '0'),
  'QuoteCustomer' || i,
  'QuoteSurname' || i,
  'quotecustomer' || i || '@example.com',
  CASE (i % 4) 
    WHEN 0 THEN 'Toyota'
    WHEN 1 THEN 'Honda'
    WHEN 2 THEN 'Ford'
    ELSE 'BMW'
  END,
  CASE (i % 4)
    WHEN 0 THEN 'Camry'
    WHEN 1 THEN 'Civic'
    WHEN 2 THEN 'F-150'
    ELSE '3 Series'
  END,
  2020 + (i % 4),
  CASE (i % 3)
    WHEN 0 THEN 'draft'
    WHEN 1 THEN 'sent'
    ELSE 'accepted'
  END,
  (random() * 1000)::numeric(10,2),
  (random() * 1200)::numeric(10,2)
FROM generate_series(1, 33) i;

-- Create 60 invoices
INSERT INTO invoices (
  invoice_number,
  customer_first_name,
  customer_last_name,
  customer_email,
  vehicle_make,
  vehicle_model,
  vehicle_year,
  status,
  subtotal,
  total,
  payment_status
)
SELECT 
  'INV-2024-' || LPAD(i::text, 4, '0'),
  'InvoiceCustomer' || i,
  'InvoiceSurname' || i,
  'invoicecustomer' || i || '@example.com',
  CASE (i % 4) 
    WHEN 0 THEN 'Toyota'
    WHEN 1 THEN 'Honda'
    WHEN 2 THEN 'Ford'
    ELSE 'BMW'
  END,
  CASE (i % 4)
    WHEN 0 THEN 'Camry'
    WHEN 1 THEN 'Civic'
    WHEN 2 THEN 'F-150'
    ELSE '3 Series'
  END,
  2020 + (i % 4),
  CASE (i % 3)
    WHEN 0 THEN 'draft'
    WHEN 1 THEN 'sent'
    ELSE 'paid'
  END,
  (random() * 1000)::numeric(10,2),
  (random() * 1200)::numeric(10,2),
  CASE (i % 2)
    WHEN 0 THEN 'paid'
    ELSE 'unpaid'
  END
FROM generate_series(1, 60) i;

-- Create some service bays
INSERT INTO service_bays (name, status)
VALUES 
  ('Bay 1', 'available'),
  ('Bay 2', 'available'),
  ('Bay 3', 'occupied'),
  ('Bay 4', 'maintenance');

-- Add dark_logo_url and light_logo_url columns to business_profile
ALTER TABLE IF EXISTS business_profile 
ADD COLUMN IF NOT EXISTS dark_logo_url text,
ADD COLUMN IF NOT EXISTS light_logo_url text;
