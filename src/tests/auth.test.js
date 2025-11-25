const request = require('supertest');
const app = require('../app');
const { User, Seller, sequelize } = require('../models');

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Seller.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  describe('POST /api/auth/signin - Positive Test Cases', () => {
    test('TC-001: Should successfully sign in customer with valid credentials', async () => {
      const testUser = await User.create({
        fullName: 'Test Customer',
        email: 'customer@test.com',
        phoneNumber: '1234567890',
        password: 'password123',
        role: 'Customer',
      });

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'customer@test.com',
          password: 'password123',
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Sign in successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', testUser.id);
      expect(response.body.user).toHaveProperty('email', 'customer@test.com');
      expect(response.body.user).toHaveProperty('role', 'Customer');
      expect(response.body.user).toHaveProperty('fullName', 'Test Customer');
      expect(response.body.user).not.toHaveProperty('password');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    test('TC-002: Should successfully sign in seller with valid credentials', async () => {
      const testSeller = await User.create({
        fullName: 'Test Seller',
        email: 'seller@test.com',
        phoneNumber: '',
        password: 'seller123',
        role: 'Seller',
      });

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'seller@test.com',
          password: 'seller123',
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Sign in successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', testSeller.id);
      expect(response.body.user).toHaveProperty('email', 'seller@test.com');
      expect(response.body.user).toHaveProperty('role', 'Seller');
      expect(response.body.user).toHaveProperty('fullName', 'Test Seller');
      expect(response.body.user).not.toHaveProperty('password');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/signin - Negative Test Cases', () => {
    test('TC-003: Should return 401 for invalid email', async () => {
      await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        role: 'Customer',
      });

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body).not.toHaveProperty('user');
    });

    test('TC-004: Should return 401 for invalid password', async () => {
      await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        role: 'Customer',
      });

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body).not.toHaveProperty('user');
    });
  });
});

