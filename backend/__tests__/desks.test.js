const request = require('supertest');
const app = require('../server');

describe('Desks API', () => {
  let adminToken;

  beforeAll(async () => {
    // Login as admin to get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@coworking.local',
        password: 'admin123'
      });

    adminToken = response.body.token;
  });

  describe('GET /api/desks', () => {
    it('should return all active desks', async () => {
      const response = await request(app)
        .get('/api/desks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0].active).toBe(1);
    });
  });

  describe('POST /api/admin/desks', () => {
    it('should create a new desk with admin token', async () => {
      const response = await request(app)
        .post('/api/admin/desks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Desk'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Desk');
      expect(response.body.active).toBe(1);
    });

    it('should reject desk creation without admin token', async () => {
      const response = await request(app)
        .post('/api/admin/desks')
        .send({
          name: 'Unauthorized Desk'
        });

      expect(response.status).toBe(401);
    });
  });
});
