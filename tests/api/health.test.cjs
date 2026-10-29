const { request } = require('../support/api-client.cjs');

describe('Health and System Contract (GET /api/v1/health)', () => {
  test('returns 200 OK with unified health and database status envelope', async () => {
    const response = await request({ path: '/api/v1/health' });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      success: true,
      errors: null,
      data: expect.objectContaining({
        api_version: 'v1',
        database: expect.objectContaining({
          status: 'connected',
        }),
      }),
    });
    expect(typeof response.data.message).toBe('string');
    expect(typeof response.data.data.service).toBe('string');
    expect(typeof response.data.data.environment).toBe('string');
    expect(typeof response.data.data.timestamp).toBe('string');
  });

  test('is accessible publicly without authorization headers', async () => {
    const response = await request({
      path: '/api/v1/health',
      headers: { authorization: '' },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('rejects unexpected sub-paths with 404 not found', async () => {
    const response = await request({ path: '/api/v1/health/unexpected' });

    expect(response.status).toBe(404);
  });

  test('rejects unsupported HTTP methods with 405 Method Not Allowed', async () => {
    const response = await request({
      path: '/api/v1/health',
      method: 'POST',
      body: { dummy: 'test' },
    });

    expect([405, 404]).toContain(response.status);
  });
});
