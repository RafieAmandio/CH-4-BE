import request from 'supertest';
import { Express } from 'express';
import { Providers } from '@prisma/client';
import app from '../../../src/app';
import prisma from '../../../src/config/database';
import { hashPassword } from '../../../src/utils/password';
import { generateToken } from '../../../src/utils/token';

describe('Auth Routes Integration Tests', () => {
  let server: Express;

  beforeAll(async () => {
    server = app;
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Clean up database after all tests
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    const validRegisterData = {
      auth: Providers.EMAIL,
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Tester',
      photo_link: 'photo.jpg',
      is_active: true
    };

    const validRegisterDataForDB = {
      auth: Providers.EMAIL,
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Tester',
      photo_link: 'photo.jpg',
      is_active: true
    };

    it('should register a new user successfully', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send(validRegisterData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            email: validRegisterData.email,
            username: validRegisterData.username,
            name: validRegisterData.name,
            nickname: validRegisterData.nickname
          },
          token: expect.any(String)
        }
      });

      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: validRegisterData.email }
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.email).toBe(validRegisterData.email);
    });

    it('should return 400 when email already exists', async () => {
      // Create a user first
      await prisma.user.create({
        data: {
          ...validRegisterDataForDB,
          password_hash: await hashPassword(validRegisterData.password)
        }
      });

      const response = await request(server)
        .post('/api/auth/register')
        .send(validRegisterData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Registration failed',
        errors: [{ field: 'email', message: 'Email already in use' }]
      });
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        ...validRegisterData,
        email: 'invalid-email'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('email')
          })
        ])
      );
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing other required fields
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String)
          })
        ])
      );
    });

    it('should return 400 for weak password', async () => {
      const weakPasswordData = {
        ...validRegisterData,
        password: '123'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringMatching(/password/i)
          })
        ])
      );
    });
  });

  describe('POST /api/auth/login', () => {
    const userData = {
      auth: Providers.EMAIL,
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Tester',
      photo_link: 'photo.jpg',
      is_active: true
    };

    const userDataForDB2 = {
      auth: Providers.EMAIL,
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Tester',
      photo_link: 'photo.jpg',
      is_active: true
    };

    const userDataForDB = {
      auth: Providers.EMAIL,
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Tester',
      photo_link: 'photo.jpg',
      is_active: true
    };

    beforeEach(async () => {
      // Create a test user before each login test
      await prisma.user.create({
        data: {
          ...userDataForDB,
          password_hash: await hashPassword(userData.password)
        }
      });
    });

    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: userData.email,
        password: userData.password
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            email: userData.email,
            username: userData.username,
            name: userData.name
          },
          token: expect.any(String)
        }
      });

      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid email', async () => {
      const invalidLoginData = {
        email: 'nonexistent@example.com',
        password: userData.password
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(invalidLoginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Login failed',
        errors: [{ field: 'credentials', message: 'Invalid email or password' }]
      });
    });

    it('should return 401 for invalid password', async () => {
      const invalidLoginData = {
        email: userData.email,
        password: 'wrongpassword'
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(invalidLoginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Login failed',
        errors: [{ field: 'credentials', message: 'Invalid email or password' }]
      });
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String)
          })
        ])
      );
    });

    it('should return 400 for invalid email format', async () => {
      const invalidLoginData = {
        email: 'invalid-email',
        password: userData.password
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(invalidLoginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('email')
          })
        ])
      );
    });
  });

  describe('GET /api/auth/profile', () => {
    const userData = {
      auth: Providers.EMAIL,
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Tester',
      photo_link: 'photo.jpg',
      is_active: true
    };

    const userDataForDB3 = {
      auth: Providers.EMAIL,
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Tester',
      photo_link: 'photo.jpg',
      is_active: true
    };

    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create a test user and generate token
      const user = await prisma.user.create({
        data: {
          ...userDataForDB3,
          password_hash: await hashPassword(userData.password)
        }
      });
      userId = user.id;
      authToken = generateToken({ id: user.id, email: user.email });
    });

    it('should return user profile with valid token', async () => {
      const response = await request(server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: userId,
          email: userData.email,
          username: userData.username,
          name: userData.name
        }
      });

      expect(response.body.data).not.toHaveProperty('passwordHash');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(server)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Authentication required',
        errors: [{ field: 'token', message: 'No token provided' }]
      });
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Authentication failed',
        errors: [{ field: 'token', message: 'Invalid or expired token' }]
      });
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(server)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Authentication required',
        errors: [{ field: 'token', message: 'No token provided' }]
      });
    });

    it('should return 401 when user is deleted but token is still valid', async () => {
      // Delete the user
      await prisma.user.delete({ where: { id: userId } });

      const response = await request(server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Authentication failed',
        errors: [{ field: 'token', message: 'User not found' }]
      });
    });
  });
});