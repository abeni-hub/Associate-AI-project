const { request } = require('../support/api-client.cjs');
const { FixtureTracker, getAdminToken, runPrefix, shouldSkipMutations } = require('../support/fixtures.cjs');

describe('Document Requirements Lifecycle and Boundaries', () => {
  const tracker = new FixtureTracker();
  let token = null;

  beforeAll(async () => {
    token = await getAdminToken('super_admin');
  });

  afterAll(async () => {
    await tracker.cleanup();
  });

  describe('Validation Partitions (POST /api/v1/documents)', () => {
    test('rejects empty payload with 422', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/documents',
        method: 'POST',
        token,
        body: {},
      });

      expect(res.status).toBe(422);
      expect(res.data.errors).toHaveProperty('name');
      expect(res.data.errors).toHaveProperty('code');
    });
  });

  describe('Document CRUD Lifecycle', () => {
    test('creates, updates, and deletes a document when mutations are enabled', async () => {
      if (shouldSkipMutations() || !token) return;

      const docCode = `${runPrefix}_doc`;
      // 1. Create
      const createRes = await request({
        path: '/api/v1/documents',
        method: 'POST',
        token,
        body: {
          name: `Document ${runPrefix}`,
          code: docCode,
          description: 'Required identification document for testing',
          is_active: true,
        },
      });

      expect([201, 200]).toContain(createRes.status);
      const docId = createRes.data?.data?.id;
      expect(docId).toBeDefined();
      tracker.register('document', docId, { token });

      // 2. Read
      const readRes = await request({
        path: `/api/v1/documents/${docId}`,
        token,
      });
      expect(readRes.status).toBe(200);
      expect(readRes.data.data.code).toBe(docCode);

      // 3. Update
      const updateRes = await request({
        path: `/api/v1/documents/${docId}`,
        method: 'PUT',
        token,
        body: {
          name: `Updated Document ${runPrefix}`,
        },
      });
      expect(updateRes.status).toBe(200);

      // 4. Delete
      const deleteRes = await request({
        path: `/api/v1/documents/${docId}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(deleteRes.status);
    });
  });
});
