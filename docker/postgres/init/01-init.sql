-- Initialize WellSense AI PostgreSQL Database
-- This script runs when the container starts for the first time

-- Create additional databases if needed
CREATE DATABASE wellsense_ai_test;
CREATE DATABASE wellsense_ai_dev;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE wellsense_ai TO postgres;
GRANT ALL PRIVILEGES ON DATABASE wellsense_ai_test TO postgres;
GRANT ALL PRIVILEGES ON DATABASE wellsense_ai_dev TO postgres;

-- Create a read-only user for analytics
CREATE USER wellsense_readonly WITH PASSWORD 'Abhay#1709';
GRANT CONNECT ON DATABASE wellsense_ai TO wellsense_readonly;
GRANT USAGE ON SCHEMA public TO wellsense_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO wellsense_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO wellsense_readonly;