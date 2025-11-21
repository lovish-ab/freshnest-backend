const request = require('supertest');
const express = require('express');
const { sequelize, User, Seller } = require('../models');
const authController = require('../controllers/authController');

const app = express();
app.use(express.json());
app.post('/api/auth/signup', authController.customerSignup);
app.post('/api/auth/seller/signup', authController.sellerSignup);
app.post('/api/auth/signin', authController.signin);

describe('Authentication System Tests', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
    await Seller.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    await User.destroy({ where: {}, force: true });
    await Seller.destroy({ where: {}, force: true });
    await sequelize.close();
  });

  describe('Customer Signup', () => {
    describe('Positive Tests', () => {
      test('should register a new customer with valid data', async () => {
        const customerData = {
          fullName: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '1234567890',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'Customer registered successfully');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('fullName', 'John Doe');
        expect(response.body.user).toHaveProperty('email', 'john@example.com');
        expect(response.body.user).toHaveProperty('role', 'Customer');
        expect(response.body.user).not.toHaveProperty('password');

        const user = await User.findOne({ where: { email: 'john@example.com' } });
        expect(user).toBeTruthy();
        expect(user.role).toBe('Customer');
        expect(user.phoneNumber).toBe('1234567890');
      });

      test('should hash password before storing', async () => {
        const customerData = {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phoneNumber: '9876543210',
          password: 'password123',
        };

        await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(201);

        const user = await User.findOne({ where: { email: 'jane@example.com' } });
        expect(user.password).not.toBe('password123');
        expect(user.password.length).toBeGreaterThan(20);
      });

      test('should return a valid JWT token', async () => {
        const customerData = {
          fullName: 'Test User',
          email: 'test@example.com',
          phoneNumber: '1111111111',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(201);

        expect(response.body.token).toBeTruthy();
        expect(typeof response.body.token).toBe('string');
        expect(response.body.token.split('.').length).toBe(3);
      });
    });

    describe('Negative Tests', () => {
      test('should reject signup with missing fullName', async () => {
        const customerData = {
          email: 'test@example.com',
          phoneNumber: '1234567890',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'All fields are required');
      });

      test('should reject signup with missing email', async () => {
        const customerData = {
          fullName: 'Test User',
          phoneNumber: '1234567890',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'All fields are required');
      });

      test('should reject signup with missing phoneNumber', async () => {
        const customerData = {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'All fields are required');
      });

      test('should reject signup with missing password', async () => {
        const customerData = {
          fullName: 'Test User',
          email: 'test@example.com',
          phoneNumber: '1234567890',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'All fields are required');
      });

      test('should reject signup with duplicate email', async () => {
        const customerData = {
          fullName: 'First User',
          email: 'duplicate@example.com',
          phoneNumber: '1234567890',
          password: 'password123',
        };

        await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(201);

        const response = await request(app)
          .post('/api/auth/signup')
          .send({
            ...customerData,
            fullName: 'Second User',
            phoneNumber: '9876543210',
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Email already exists');
      });

      test('should reject signup with empty string fields', async () => {
        const customerData = {
          fullName: '',
          email: '',
          phoneNumber: '',
          password: '',
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'All fields are required');
      });
    });
  });

  describe('Seller Signup', () => {
    describe('Positive Tests', () => {
      test('should register a new seller with valid data', async () => {
        const sellerData = {
          fullName: 'Seller Name',
          email: 'seller@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'Seller registered successfully');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('fullName', 'Seller Name');
        expect(response.body.user).toHaveProperty('email', 'seller@example.com');
        expect(response.body.user).toHaveProperty('role', 'Seller');

        const user = await User.findOne({ where: { email: 'seller@example.com' } });
        expect(user).toBeTruthy();
        expect(user.role).toBe('Seller');
        expect(user.phoneNumber).toBe('');

        const seller = await Seller.findOne({ where: { userId: user.id } });
        expect(seller).toBeTruthy();
      });

      test('should create seller profile along with user', async () => {
        const sellerData = {
          fullName: 'Another Seller',
          email: 'anotherseller@example.com',
          password: 'password123',
        };

        await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(201);

        const user = await User.findOne({ where: { email: 'anotherseller@example.com' } });
        const seller = await Seller.findOne({ where: { userId: user.id } });
        expect(seller).toBeTruthy();
        expect(seller.userId).toBe(user.id);
      });

      test('should hash password before storing', async () => {
        const sellerData = {
          fullName: 'Password Test Seller',
          email: 'passwordtest@example.com',
          password: 'password123',
        };

        await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(201);

        const user = await User.findOne({ where: { email: 'passwordtest@example.com' } });
        expect(user.password).not.toBe('password123');
        expect(user.password.length).toBeGreaterThan(20);
      });

      test('should return a valid JWT token', async () => {
        const sellerData = {
          fullName: 'Token Test Seller',
          email: 'tokentest@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(201);

        expect(response.body.token).toBeTruthy();
        expect(typeof response.body.token).toBe('string');
        expect(response.body.token.split('.').length).toBe(3);
      });
    });

    describe('Negative Tests', () => {
      test('should reject signup with missing fullName', async () => {
        const sellerData = {
          email: 'test@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'All fields are required');
      });

      test('should reject signup with missing email', async () => {
        const sellerData = {
          fullName: 'Test Seller',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'All fields are required');
      });

      test('should reject signup with missing password', async () => {
        const sellerData = {
          fullName: 'Test Seller',
          email: 'test@example.com',
        };

        const response = await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'All fields are required');
      });

      test('should reject signup with duplicate email', async () => {
        const sellerData = {
          fullName: 'First Seller',
          email: 'duplicate@example.com',
          password: 'password123',
        };

        await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(201);

        const response = await request(app)
          .post('/api/auth/seller/signup')
          .send({
            ...sellerData,
            fullName: 'Second Seller',
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Email already exists');
      });

      test('should reject signup if customer with same email exists', async () => {
        const customerData = {
          fullName: 'Customer User',
          email: 'shared@example.com',
          phoneNumber: '1234567890',
          password: 'password123',
        };

        await request(app)
          .post('/api/auth/signup')
          .send(customerData)
          .expect(201);

        const sellerData = {
          fullName: 'Seller User',
          email: 'shared@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Email already exists');
      });

      test('should reject signup with empty string fields', async () => {
        const sellerData = {
          fullName: '',
          email: '',
          password: '',
        };

        const response = await request(app)
          .post('/api/auth/seller/signup')
          .send(sellerData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'All fields are required');
      });
    });
  });

  describe('Sign In', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test Customer',
          email: 'customer@example.com',
          phoneNumber: '1234567890',
          password: 'password123',
        });

      await request(app)
        .post('/api/auth/seller/signup')
        .send({
          fullName: 'Test Seller',
          email: 'seller@example.com',
          password: 'password123',
        });
    });

    describe('Positive Tests', () => {
      test('should sign in customer with valid credentials', async () => {
        const loginData = {
          email: 'customer@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Sign in successful');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('email', 'customer@example.com');
        expect(response.body.user).toHaveProperty('role', 'Customer');
        expect(response.body.user).not.toHaveProperty('password');
      });

      test('should sign in seller with valid credentials', async () => {
        const loginData = {
          email: 'seller@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Sign in successful');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('email', 'seller@example.com');
        expect(response.body.user).toHaveProperty('role', 'Seller');
        expect(response.body.user).not.toHaveProperty('password');
      });

      test('should return a valid JWT token on signin', async () => {
        const loginData = {
          email: 'customer@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(200);

        expect(response.body.token).toBeTruthy();
        expect(typeof response.body.token).toBe('string');
        expect(response.body.token.split('.').length).toBe(3);
      });

      test('should return user details without password', async () => {
        const loginData = {
          email: 'customer@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(200);

        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body.user).toHaveProperty('fullName');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).toHaveProperty('role');
      });
    });

    describe('Negative Tests', () => {
      test('should reject signin with missing email', async () => {
        const loginData = {
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Email and password are required');
      });

      test('should reject signin with missing password', async () => {
        const loginData = {
          email: 'customer@example.com',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Email and password are required');
      });

      test('should reject signin with non-existent email', async () => {
        const loginData = {
          email: 'nonexistent@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Invalid email or password');
      });

      test('should reject signin with incorrect password', async () => {
        const loginData = {
          email: 'customer@example.com',
          password: 'wrongpassword',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Invalid email or password');
      });

      test('should reject signin with empty email', async () => {
        const loginData = {
          email: '',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Email and password are required');
      });

      test('should reject signin with empty password', async () => {
        const loginData = {
          email: 'customer@example.com',
          password: '',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Email and password are required');
      });

      test('should reject signin with case-sensitive email mismatch', async () => {
        const loginData = {
          email: 'CUSTOMER@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Invalid email or password');
      });
    });
  });

  describe('Token Validation', () => {
    test('should generate different tokens for different users', async () => {
      const customer1 = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'User One',
          email: 'user1@example.com',
          phoneNumber: '1111111111',
          password: 'password123',
        })
        .expect(201);

      const customer2 = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'User Two',
          email: 'user2@example.com',
          phoneNumber: '2222222222',
          password: 'password123',
        })
        .expect(201);

      expect(customer1.body.token).not.toBe(customer2.body.token);
    });

    test('should generate same token for same user on multiple signins', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Token Test User',
          email: 'tokentest@example.com',
          phoneNumber: '3333333333',
          password: 'password123',
        })
        .expect(201);

      const signin1 = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'tokentest@example.com',
          password: 'password123',
        })
        .expect(200);

      const signin2 = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'tokentest@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(signin1.body.token).toBeTruthy();
      expect(signin2.body.token).toBeTruthy();
      expect(signin1.body.user.id).toBe(signin2.body.user.id);
    });
  });
});

