// Test setup file
require('dotenv').config();

// Set default JWT_SECRET for testing if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
}

// Set test database configuration if not provided
if (!process.env.DB_NAME) {
  process.env.DB_NAME = process.env.DB_NAME || 'freshnest_test_db';
}

