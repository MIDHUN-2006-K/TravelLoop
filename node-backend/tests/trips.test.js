import request from 'supertest';
import app from '../src/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Trip Endpoints', () => {
  let authToken;
  let testUserId;
  let testTripId;

  beforeAll(async () => {
    // Create test user and get token
    const signupResponse = await request(app)
      .post('/auth/signup')
      .send({
        email: 'test_trips@example.com',
        password: 'password123',
        name: 'Trip Test User'
      });

    authToken = signupResponse.body.token;
    testUserId = signupResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.trip.deleteMany({
      where: {
        user_id: testUserId
      }
    });
    await prisma.user.delete({
      where: { user_id: testUserId }
    });
    await prisma.$disconnect();
  });

  describe('POST /trips', () => {
    it('should create a new trip', async () => {
      const response = await request(app)
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          trip_name: 'Test Trip',
          start_date: '2026-06-01',
          end_date: '2026-06-10',
          description: 'A test trip'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('trip_id');
      expect(response.body.trip_name).toBe('Test Trip');
      expect(response.body.is_public).toBe(false);

      testTripId = response.body.trip_id;
    });

    it('should reject trip without authentication', async () => {
      const response = await request(app)
        .post('/trips')
        .send({
          trip_name: 'Test Trip',
          start_date: '2026-06-01',
          end_date: '2026-06-10'
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          trip_name: 'Test Trip'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /trips', () => {
    it('should list user trips', async () => {
      const response = await request(app)
        .get('/trips?user=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /trips/:id', () => {
    it('should get trip details', async () => {
      const response = await request(app)
        .get(`/trips/${testTripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.trip_id).toBe(testTripId);
    });

    it('should return 404 for non-existent trip', async () => {
      const response = await request(app)
        .get('/trips/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /trips/:id', () => {
    it('should update trip', async () => {
      const response = await request(app)
        .patch(`/trips/${testTripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          trip_name: 'Updated Trip Name',
          is_public: true
        });

      expect(response.status).toBe(200);
      expect(response.body.trip_name).toBe('Updated Trip Name');
      expect(response.body.is_public).toBe(true);
    });
  });

  describe('DELETE /trips/:id', () => {
    it('should delete trip', async () => {
      const response = await request(app)
        .delete(`/trips/${testTripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });
});

