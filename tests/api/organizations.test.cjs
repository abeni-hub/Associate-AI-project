const { request } = require('../support/api-client.cjs');
const { FixtureTracker, getAdminToken, runPrefix, shouldSkipMutations } = require('../support/fixtures.cjs');

describe('Organization Lifecycle, Boundary Validations, and Integrity Guards', () => {
  const tracker = new FixtureTracker();
  let token = null;

  beforeAll(async () => {
    token = await getAdminToken('super_admin');
  });

  afterAll(async () => {
    await tracker.cleanup();
  });

  describe('Validation Partitions (POST /api/v1/organizations)', () => {
    test('rejects empty payload with 422 validation envelope', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/organizations',
        method: 'POST',
        token,
        body: {},
      });

      expect(res.status).toBe(422);
      expect(res.data).toMatchObject({
        success: false,
        data: null,
        errors: expect.any(Object),
      });
      expect(res.data.errors).toHaveProperty('name');
      expect(res.data.errors).toHaveProperty('code');
      expect(res.data.errors).toHaveProperty('type_id');
    });

    test('rejects invalid or non-existent type_id with 422', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/organizations',
        method: 'POST',
        token,
        body: {
          name: 'Invalid Type Org',
          code: `${runPrefix}_invalid_type`,
          type_id: 999999,
        },
      });

      expect(res.status).toBe(422);
      expect(res.data.errors).toHaveProperty('type_id');
    });

    test('safely rejects hostile or overlong inputs with validation error instead of 500', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/organizations',
        method: 'POST',
        token,
        body: {
          name: 'A'.repeat(500),
          code: '<script>alert(1)</script>',
          type_id: 1,
        },
      });

      expect([422, 400]).toContain(res.status);
      expect(res.status).not.toBe(500);
    });
  });

  describe('CRUD Lifecycle and Integrity Guards', () => {
    test('creates, reads, updates, and deletes an organization when mutations are enabled', async () => {
      if (shouldSkipMutations() || !token) return;

      const orgCode = `${runPrefix}_org_crud`;
      // 1. Create
      const createRes = await request({
        path: '/api/v1/organizations',
        method: 'POST',
        token,
        body: {
          name: `Test Organization ${runPrefix}`,
          code: orgCode,
          type_id: 1, // Sub-City
          description: 'E2E lifecycle verification organization',
        },
      });

      expect([201, 200]).toContain(createRes.status);
      const orgId = createRes.data?.data?.id;
      expect(orgId).toBeDefined();
      tracker.register('organization', orgId, { token });

      // 2. Read detail
      const readRes = await request({
        path: `/api/v1/organizations/${orgId}`,
        token,
      });
      expect(readRes.status).toBe(200);
      expect(readRes.data.data.code).toBe(orgCode);

      // 3. Update
      const updateRes = await request({
        path: `/api/v1/organizations/${orgId}`,
        method: 'PUT',
        token,
        body: {
          name: `Updated Org Name ${runPrefix}`,
        },
      });
      expect(updateRes.status).toBe(200);
      expect(updateRes.data.data.name).toBe(`Updated Org Name ${runPrefix}`);

      // 4. Duplicate code collision guard
      const duplicateRes = await request({
        path: '/api/v1/organizations',
        method: 'POST',
        token,
        body: {
          name: 'Duplicate Org Attempt',
          code: orgCode,
          type_id: 1,
        },
      });
      expect(duplicateRes.status).toBe(422);

      // 5. Delete
      const deleteRes = await request({
        path: `/api/v1/organizations/${orgId}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(deleteRes.status);

      // 6. Confirm deleted
      const confirmRes = await request({
        path: `/api/v1/organizations/${orgId}`,
        token,
      });
      expect(confirmRes.status).toBe(404);
    });

    test('enforces child organization deletion guard (cannot delete parent with active children)', async () => {
      if (shouldSkipMutations() || !token) return;

      // 1. Create parent
      const parentRes = await request({
        path: '/api/v1/organizations',
        method: 'POST',
        token,
        body: {
          name: `Parent Org ${runPrefix}`,
          code: `${runPrefix}_parent_guard`,
          type_id: 1, // Sub-City
        },
      });
      if (parentRes.status !== 201 && parentRes.status !== 200) return;
      const parentId = parentRes.data.data.id;
      tracker.register('organization', parentId, { token });

      // 2. Create child under parent
      const childRes = await request({
        path: '/api/v1/organizations',
        method: 'POST',
        token,
        body: {
          name: `Child Org ${runPrefix}`,
          code: `${runPrefix}_child_guard`,
          type_id: 2, // Woreda
          parent_id: parentId,
        },
      });
      if (childRes.status !== 201 && childRes.status !== 200) return;
      const childId = childRes.data.data.id;
      tracker.register('organization', childId, { token });

      // 3. Attempt to delete parent while child exists -> Must be guarded (422)
      const deleteParentRes = await request({
        path: `/api/v1/organizations/${parentId}`,
        method: 'DELETE',
        token,
      });
      expect([422, 400, 409]).toContain(deleteParentRes.status);

      // 4. Clean up child first, then parent can be deleted
      const deleteChildRes = await request({
        path: `/api/v1/organizations/${childId}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(deleteChildRes.status);

      const deleteParentAfterRes = await request({
        path: `/api/v1/organizations/${parentId}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(deleteParentAfterRes.status);
    });
  });
});
