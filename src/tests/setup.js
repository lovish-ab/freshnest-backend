require('dotenv').config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
}

if (!process.env.DB_NAME) {
  process.env.DB_NAME = process.env.DB_NAME || 'freshnest_test_db';
}

