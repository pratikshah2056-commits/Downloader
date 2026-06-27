const request = require('supertest');

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue({ connection: { host: 'test' } }),
    connection: { host: 'test' },
  };
});

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

// Mock User Model to prevent DB connection buffering timeout
jest.mock('../models/User', () => {
  const mockFindOne = jest.fn().mockImplementation(() => {
    const query = {
      select: jest.fn().mockResolvedValue(null)
    };
    query.then = function(onFulfilled) {
      return Promise.resolve(null).then(onFulfilled);
    };
    return query;
  });
  return {
    findOne: mockFindOne,
    create: jest.fn(),
  };
});

const app = require('../index');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'notanemail',
          password: 'test123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '12',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notvalid',
          password: 'test123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('running');
    });
  });

  describe('POST /api/auth/google', () => {
    it('should return 400 for missing credential token', async () => {
      const res = await request(app)
        .post('/api/auth/google')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should auto-login new Google users without OTP', async () => {
      const User = require('../models/User');
      User.findOne.mockImplementationOnce(() => {
        const query = {
          select: jest.fn().mockResolvedValue(null)
        };
        query.then = function(onFulfilled) {
          return Promise.resolve(null).then(onFulfilled);
        };
        return query;
      });
      User.create.mockResolvedValueOnce({
        _id: '507f1f77bcf86cd799439011',
        username: 'mock_google_test',
        email: 'test@gmail.com',
        role: 'user',
        isVerified: true,
        createdAt: new Date(),
        toJSON: function() { return this; },
      });

      const res = await request(app)
        .post('/api/auth/google')
        .send({ credential: 'mock_google_test' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });
  });

  describe('POST /api/auth/verify-otp (removed)', () => {
    it('should return 404 — route no longer exists', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: 'test@example.com', otp: '123456' });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/auth/resend-otp (removed)', () => {
    it('should return 404 — route no longer exists', async () => {
      const res = await request(app)
        .post('/api/auth/resend-otp')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(404);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/api/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
