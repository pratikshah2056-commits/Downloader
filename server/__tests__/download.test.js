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
    it('should be publicly accessible and return 400 for invalid URL', async () => {
      const res = await request(app)
        .post('/api/download/info')
        .send({ url: 'invalid-url' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/download/history', () => {
    it('should be publicly accessible and return empty history', async () => {
      const res = await request(app)
        .get('/api/download/history');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.downloads).toEqual([]);
    });
  });

  describe('DELETE /api/download/history/:id', () => {
    it('should be publicly accessible and return 404 for non-existent entry', async () => {
      const res = await request(app)
        .delete('/api/download/history/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/download/stats', () => {
    it('should be publicly accessible and return empty stats', async () => {
      const res = await request(app)
        .get('/api/download/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalDownloads).toBe(0);
    });
  });
});
