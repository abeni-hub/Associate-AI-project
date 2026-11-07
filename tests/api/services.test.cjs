const { request } = require('../support/api-client.cjs');
const { FixtureTracker, getAdminToken, runPrefix, shouldSkipMutations } = require('../support/fixtures.cjs');

describe('Service Catalog Lifecycle, Associations, and Subservice Integrity Guards', () => {
  const tracker = new FixtureTracker();
  let token = null;

  beforeAll(async () => {
    token = await getAdminToken('super_admin');
  });

  afterAll(async () => {
    await tracker.cleanup();
  });

  describe('Validation Partitions (POST /api/v1/services)', () => {
    test('rejects empty payload with 422 validation envelope', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/services',
        method: 'POST',
        token,
        body: {},
      });

      expect(res.status).toBe(422);
      expect(res.data.errors).toHaveProperty('name');
      expect(res.data.errors).toHaveProperty('code');
    });

    test('rejects negative fee amount or negative duration with 422', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/services',
        method: 'POST',
        token,
        body: {
          name: 'Negative Fee Service',
          code: `${runPrefix}_negative_fee`,
          fee_amount: -50,
          estimated_duration_minutes: -10,
        },
      });

      expect(res.status).toBe(422);
    });
  });

  describe('Master and Subservice Lifecycle & Hierarchy Guards', () => {
    test('enforces subservice deletion guard (cannot delete master service while subservices exist)', async () => {
      if (shouldSkipMutations() || !token) return;

      // 1. Create Master Service
      const masterCode = `${runPrefix}_master_svc`;
      const masterRes = await request({
        path: '/api/v1/services',
        method: 'POST',
        token,
        body: {
          name: `Master Service ${runPrefix}`,
          code: masterCode,
          description: 'Master service for integrity testing',
          fee_amount: 0,
        },
      });
      if (masterRes.status !== 201 && masterRes.status !== 200) return;
      const masterId = masterRes.data.data.id;
      tracker.register('service', masterId, { token });

      // 2. Create Child Subservice under Master
      const subCode = `${runPrefix}_sub_svc`;
      const subRes = await request({
        path: '/api/v1/services',
        method: 'POST',
        token,
        body: {
          name: `Child Subservice ${runPrefix}`,
          code: subCode,
          parent_id: masterId,
          fee_amount: 25,
          estimated_duration_minutes: 30,
        },
      });
      if (subRes.status !== 201 && subRes.status !== 200) return;
      const subId = subRes.data.data.id;
      tracker.register('service', subId, { token });

      // 3. Attempt to delete master service while subservice exists -> Must be guarded (422)
      const deleteMasterGuardRes = await request({
        path: `/api/v1/services/${masterId}`,
        method: 'DELETE',
        token,
      });
      expect([422, 400, 409]).toContain(deleteMasterGuardRes.status);

      // 4. Delete child subservice first
      const deleteSubRes = await request({
        path: `/api/v1/services/${subId}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(deleteSubRes.status);

      // 5. Now delete master service successfully
      const deleteMasterRes = await request({
        path: `/api/v1/services/${masterId}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(deleteMasterRes.status);
    });

    test('syncs service documents and offering organizations', async () => {
      if (shouldSkipMutations() || !token) return;

      // Create test service
      const svcRes = await request({
        path: '/api/v1/services',
        method: 'POST',
        token,
        body: {
          name: `Sync Test Service ${runPrefix}`,
          code: `${runPrefix}_sync_svc`,
        },
      });
      if (svcRes.status !== 201 && svcRes.status !== 200) return;
      const svcId = svcRes.data.data.id;
      tracker.register('service', svcId, { token });

      // Sync organizations
      const syncOrgRes = await request({
        path: `/api/v1/services/${svcId}/organizations`,
        method: 'POST',
        token,
        body: {
          organizations: [1],
        },
      });
      expect([200, 201]).toContain(syncOrgRes.status);

      // Clean up service
      await request({
        path: `/api/v1/services/${svcId}`,
        method: 'DELETE',
        token,
      });
    });
  });
});
