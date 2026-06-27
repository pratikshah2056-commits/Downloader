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

const app = require('../index');

describe('Download Endpoints', () => {
  describe('POST /api/download/info', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/download/info')
        .send({ url: 'https://www.youtube.com/watch?v=test' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/download/video', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/download/video')
        .send({ url: 'https://www.youtube.com/watch?v=test', format: 'mp4', quality: '720p' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/download/audio', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/download/audio')
        .send({ url: 'https://www.youtube.com/watch?v=test', format: 'mp3' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/download/history', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/download/history');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/download/history/:id', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .delete('/api/download/history/507f1f77bcf86cd799439011');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/download/stats', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/download/stats');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
