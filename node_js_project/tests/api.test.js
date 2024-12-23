const request = require('supertest');
const app = require('../src/app');
const seed = require('../scripts/seedDb');
const { sequelize } = require('../src/model');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await seed();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Contracts API', () => {
  test('GET /contracts/:id - should return contract if it belongs to the profile', async () => {
    const res = await request(app)
      .get('/contracts/1')
      .set('profile_id', 1)
      .expect(200);
    expect(res.body.id).toBe(1);
  });

  test('GET /contracts/:id - should return 404 if contract does not exist', async () => {
    await request(app)
      .get('/contracts/999')
      .set('profile_id', 1)
      .expect(404);
  });

  test('GET /contracts/:id - should return 404 if contract does not belong to profile', async () => {
    await request(app)
      .get('/contracts/1')
      .set('profile_id', 2)
      .expect(404);
  });
});

describe('Jobs API', () => {
  test('GET /jobs/unpaid - should return unpaid jobs for profile', async () => {
    const res = await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', 2)
      .expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /jobs/:job_id/pay - should pay for a job', async () => {
    const jobId = 2;
    const res = await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set('profile_id', 1)
      .expect(200);
    expect(res.body.message).toBe('Payment successful.');
  });

  test('POST /jobs/:job_id/pay - should return 400 if insufficient balance', async () => {
    const jobId = 5;
    await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set('profile_id', 4)
      .expect(400);
  });
});

describe('Balances API', () => {
  test('POST /balances/deposit/:userId - should deposit funds', async () => {
    const res = await request(app)
      .post('/balances/deposit/2')
      .set('profile_id', 2)
      .send({ amount: 50 })
      .expect(200);
    expect(res.body.message).toBe('Deposit successful.');
  });

  test('POST /balances/deposit/:userId - should not allow deposit more than 25% of unpaid jobs', async () => {
    await request(app)
      .post('/balances/deposit/2')
      .set('profile_id', 2)
      .send({ amount: 10000 })
      .expect(400);
  });
});

describe('Admin API', () => {
  test('GET /admin/best-profession - should return best profession', async () => {
    const res = await request(app)
      .get('/admin/best-profession')
      .query({ start: '2020-08-10', end: '2020-08-20' })
      .expect(200);
    expect(res.body.profession).toBeDefined();
  });

  test('GET /admin/best-clients - should return best clients', async () => {
    const res = await request(app)
      .get('/admin/best-clients')
      .query({ start: '2020-08-10', end: '2020-08-20', limit: 3 })
      .expect(200);
    expect(res.body.length).toBeLessThanOrEqual(3);
  });
});
