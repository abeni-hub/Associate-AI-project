const { request } = require('../support/api-client.cjs');

describe('Public Service Discovery Contracts', () => {
  describe('GET /api/v1/services', () => {
    test('returns paginated active services catalog publicly', async () => {
      const response = await request({ path: '/api/v1/services' });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        errors: null,
      });
      expect(Array.isArray(response.data.data)).toBe(true);
      if (response.data.data.length > 0) {
        const item = response.data.data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('code');
        expect(item).toHaveProperty('is_active');
      }
    });

    test('accepts filter query parameters without error', async () => {
      const response = await request({
        path: '/api/v1/services',
        query: {
          search: 'certificate',
          fee: 'free',
          parent_id: 'root',
          per_page: 5,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('handles extreme or unusual query parameters gracefully', async () => {
      const response = await request({
        path: '/api/v1/services',
        query: {
          search: 'x'.repeat(250),
          per_page: 1,
          fee: 'paid',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('GET /api/v1/services/{id_or_code}', () => {
    test('returns 404 error envelope for nonexistent numeric service ID', async () => {
      const response = await request({ path: '/api/v1/services/99999999' });

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        success: false,
        data: null,
      });
    });

    test('returns 404 error envelope for nonexistent slug', async () => {
      const response = await request({ path: '/api/v1/services/nonexistent-service-slug-xyz' });

      expect(response.status).toBe(404);
      expect(response.data).toMatchObject({
        success: false,
        data: null,
      });
    });

    test('handles adversarial path identifiers without throwing 500', async () => {
      const hostilePaths = [
        '/api/v1/services/--1',
        '/api/v1/services/null',
        '/api/v1/services/%27%20OR%201=1--',
      ];

      for (const path of hostilePaths) {
        const response = await request({ path });
        expect([404, 400, 422]).toContain(response.status);
        expect(response.status).not.toBe(500);
      }
    });

    test('returns complete detail envelope when service exists', async () => {
      const listRes = await request({ path: '/api/v1/services', query: { per_page: 1 } });
      if (listRes.status === 200 && listRes.data?.data?.length > 0) {
        const sample = listRes.data.data[0];
        const detailRes = await request({ path: `/api/v1/services/${sample.id}` });

        expect(detailRes.status).toBe(200);
        expect(detailRes.data).toMatchObject({
          success: true,
          data: expect.objectContaining({
            id: sample.id,
            name: expect.any(String),
            code: expect.any(String),
          }),
        });
      }
    });
  });

  describe('GET /api/v1/services/{service}/steps', () => {
    test('returns 404 for steps of nonexistent service', async () => {
      const response = await request({ path: '/api/v1/services/99999999/steps' });

      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    });

    test('returns service steps in sequential order when steps exist', async () => {
      const listRes = await request({ path: '/api/v1/services', query: { per_page: 5 } });
      if (listRes.status === 200 && listRes.data?.data?.length > 0) {
        for (const service of listRes.data.data) {
          const stepsRes = await request({ path: `/api/v1/services/${service.id}/steps` });
          if (stepsRes.status === 200 && Array.isArray(stepsRes.data?.data) && stepsRes.data.data.length > 1) {
            const steps = stepsRes.data.data;
            const positions = steps.map((s) => s.order_position ?? s.order_column ?? 0);
            const sorted = [...positions].sort((a, b) => a - b);
            expect(positions).toEqual(sorted);
            break;
          }
        }
      }
    });

    test('returns 404 for nonexistent step detail', async () => {
      const response = await request({ path: '/api/v1/services/1/steps/99999999' });

      expect([404]).toContain(response.status);
      expect(response.data.success).toBe(false);
    });
  });
});
