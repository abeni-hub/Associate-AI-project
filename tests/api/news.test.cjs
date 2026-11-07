const { request } = require('../support/api-client.cjs');
const { FixtureTracker, getAdminToken, runPrefix, shouldSkipMutations } = require('../support/fixtures.cjs');

describe('News Articles Lifecycle and Scoped Publishing Guards', () => {
  const tracker = new FixtureTracker();
  let token = null;

  beforeAll(async () => {
    token = await getAdminToken('super_admin');
  });

  afterAll(async () => {
    await tracker.cleanup();
  });

  describe('Validation Partitions (POST /api/v1/news)', () => {
    test('rejects empty news body with 422', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/news',
        method: 'POST',
        token,
        body: {},
      });

      expect(res.status).toBe(422);
      expect(res.data.errors).toHaveProperty('title');
      expect(res.data.errors).toHaveProperty('content');
    });

    test('rejects invalid news status with 422', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/news',
        method: 'POST',
        token,
        body: {
          title: 'Invalid Status News',
          content: 'Testing invalid status validation.',
          status: 'non_existent_status_enum',
        },
      });

      expect(res.status).toBe(422);
      expect(res.data.errors).toHaveProperty('status');
    });
  });

  describe('News Lifecycle', () => {
    test('creates draft news, updates to published, and deletes when mutations enabled', async () => {
      if (shouldSkipMutations() || !token) return;

      // 1. Create Draft
      const createRes = await request({
        path: '/api/v1/news',
        method: 'POST',
        token,
        body: {
          title: `Civic Update ${runPrefix}`,
          content: 'Detailed body text for public civic announcement testing.',
          summary: 'Brief overview for news cards.',
          status: 'draft',
          category: 'Announcement',
        },
      });

      expect([201, 200]).toContain(createRes.status);
      const newsId = createRes.data?.data?.id;
      expect(newsId).toBeDefined();
      tracker.register('news', newsId, { token });

      // 2. Read detail
      const readRes = await request({
        path: `/api/v1/news/${newsId}`,
        token,
      });
      expect(readRes.status).toBe(200);

      // 3. Update to Published
      const updateRes = await request({
        path: `/api/v1/news/${newsId}`,
        method: 'PUT',
        token,
        body: {
          status: 'published',
          title: `Published Civic Update ${runPrefix}`,
        },
      });
      expect(updateRes.status).toBe(200);

      // 4. Delete
      const deleteRes = await request({
        path: `/api/v1/news/${newsId}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(deleteRes.status);
    });
  });
});
