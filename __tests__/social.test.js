const supertest = require('supertest');
const server = require('../index');

describe('social routes', () => {
  it(' will not let you access social route without a token', async () => {
    await supertest(server)
      .get('/api/social')
      .expect(401);
  });
});
