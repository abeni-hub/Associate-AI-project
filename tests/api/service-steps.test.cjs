const { request } = require('../support/api-client.cjs');
const { FixtureTracker, getAdminToken, runPrefix, shouldSkipMutations } = require('../support/fixtures.cjs');

describe('Room-by-Room Service Steps Lifecycle and Reordering', () => {
  const tracker = new FixtureTracker();
  let token = null;

  beforeAll(async () => {
    token = await getAdminToken('super_admin');
  });

  afterAll(async () => {
    await tracker.cleanup();
  });

  describe('Service Steps CRUD and Reordering Lifecycle', () => {
    test('creates, reorders, and deletes service steps when mutations are enabled', async () => {
      if (shouldSkipMutations() || !token) return;

      // 1. Create a parent service to host the steps
      const svcRes = await request({
        path: '/api/v1/services',
        method: 'POST',
        token,
        body: {
          name: `Steps Host Service ${runPrefix}`,
          code: `${runPrefix}_step_svc`,
        },
      });
      if (svcRes.status !== 201 && svcRes.status !== 200) return;
      const svcId = svcRes.data.data.id;
      tracker.register('service', svcId, { token });

      // 2. Add Step 1
      const step1Res = await request({
        path: `/api/v1/services/${svcId}/steps`,
        method: 'POST',
        token,
        body: {
          title: 'Document Intake',
          room_number: 'Room 101',
          order_position: 1,
          description: 'Submit ID and initial form',
        },
      });
      expect([201, 200]).toContain(step1Res.status);
      const step1Id = step1Res.data?.data?.id;
      tracker.register('service_step', step1Id, {
        token,
        path: `/api/v1/services/${svcId}/steps/${step1Id}`,
      });

      // 3. Add Step 2
      const step2Res = await request({
        path: `/api/v1/services/${svcId}/steps`,
        method: 'POST',
        token,
        body: {
          title: 'Fee Payment',
          room_number: 'Room 105',
          order_position: 2,
          description: 'Pay processing fee at cashier',
        },
      });
      expect([201, 200]).toContain(step2Res.status);
      const step2Id = step2Res.data?.data?.id;
      tracker.register('service_step', step2Id, {
        token,
        path: `/api/v1/services/${svcId}/steps/${step2Id}`,
      });

      // 4. Update Step 1
      const updateRes = await request({
        path: `/api/v1/services/${svcId}/steps/${step1Id}`,
        method: 'PUT',
        token,
        body: {
          title: 'Updated Intake Room',
          room_number: 'Room 102',
        },
      });
      expect(updateRes.status).toBe(200);

      // 5. Reorder Steps (invert 1 and 2)
      const reorderRes = await request({
        path: `/api/v1/services/${svcId}/steps/reorder`,
        method: 'POST',
        token,
        body: {
          steps: [
            { id: step2Id, order_position: 1 },
            { id: step1Id, order_position: 2 },
          ],
        },
      });
      expect([200, 204]).toContain(reorderRes.status);

      // 6. Delete Steps
      const del1Res = await request({
        path: `/api/v1/services/${svcId}/steps/${step1Id}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(del1Res.status);

      const del2Res = await request({
        path: `/api/v1/services/${svcId}/steps/${step2Id}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(del2Res.status);
    });
  });
});
