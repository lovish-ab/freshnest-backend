# Authentication System Tests

This directory contains comprehensive test cases for the authentication system.

## Test Coverage

### Customer Signup Tests
- Positive: Valid customer registration
-  Positive: Password hashing verification
-  Positive: JWT token generation
-  Negative: Missing required fields (fullName, email, phoneNumber, password)
-  Negative: Duplicate email registration
-  Negative: Empty string fields

### Seller Signup Tests
-  Positive: Valid seller registration
-  Positive: Seller profile creation
-  Positive: Password hashing verification
-  Positive: JWT token generation
-  Negative: Missing required fields (fullName, email, password)
-  Negative: Duplicate email registration
-  Negative: Email conflict with existing customer
-  Negative: Empty string fields

### Sign In Tests
-  Positive: Customer sign in with valid credentials
-  Positive: Seller sign in with valid credentials
-  Positive: JWT token generation
-  Positive: Password exclusion from response
-  Negative: Missing email or password
-  Negative: Non-existent email
-  Negative: Incorrect password
-  Negative: Empty fields
-  Negative: Case-sensitive email mismatch

### Token Validation Tests
-  Different tokens for different users
-  Token consistency for same user

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Setup

The tests use:
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library for testing Express routes
- **Test Database** - Uses the same database configuration but cleans up after each test

## Notes

- Tests clean up the database before and after each test suite
- Tests use the same database models and controllers as production
- JWT_SECRET is set to 'test-secret-key' if not provided in environment
- All user and seller records are deleted before each test to ensure clean state

