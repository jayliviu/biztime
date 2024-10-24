\c biztime

-- Drop tables if they exist
DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

-- Create tables
CREATE TABLE companies (
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

CREATE TABLE invoices (
  id serial PRIMARY KEY,
  comp_code text NOT NULL REFERENCES companies(code) ON DELETE CASCADE,
  amt float NOT NULL,
  paid boolean DEFAULT false NOT NULL,
  add_date date DEFAULT CURRENT_DATE NOT NULL,
  paid_date date,
  CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  industry_code text PRIMARY KEY NOT NULL,
  industry VARCHAR(50) NOT NULL
);

CREATE TABLE company_industries (
  comp_code VARCHAR(50) NOT NULL,
  industry_code VARCHAR(10) NOT NULL,
  PRIMARY KEY (comp_code, industry_code),
  FOREIGN KEY (comp_code) REFERENCES companies(code) ON DELETE CASCADE,
  FOREIGN KEY (industry_code) REFERENCES industries(industry_code) ON DELETE CASCADE
);

-- Insert seed data
INSERT INTO companies (code, name, description)
VALUES
('GOOGL', 'Alphabet Inc.', 'Parent company of Google'),
('AAPL', 'Apple Inc.', 'Consumer electronics and software company'),
('AMZN', 'Amazon.com, Inc.', 'E-commerce, cloud computing, and digital streaming company'),
('MSFT', 'Microsoft Corporation', 'Software, hardware, and cloud computing company');

INSERT INTO industries (industry_code, industry)
VALUES
('tech', 'Technology'),
('ecom', 'E-commerce'),
('auto', 'Automobile'),
('health', 'Healthcare');

INSERT INTO company_industries (comp_code, industry_code)
VALUES
('AAPL', 'tech'),
('GOOGL', 'tech'),
('AMZN', 'ecom'),
('MSFT', 'tech');

INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
VALUES
('AAPL', 1000.00, false, '2024-10-01', null),
('GOOGL', 2500.00, true, '2024-09-01', '2024-09-20'),
('AMZN', 500.00, false, '2024-10-10', null),
('MSFT', 1500.00, true, '2024-08-15', '2024-08-25');
