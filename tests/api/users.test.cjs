const { request } = require('../support/api-client.cjs');
const { FixtureTracker, getAdminToken, runPrefix, shouldSkipMutations } = require('../support/fixtures.cjs');

describe('User Lifecycle, Boundaries, and Account Integrity Guards', () => {
  const tracker = new FixtureTracker();
  let token = null;

  beforeAll(async () => {
    token = await getAdminToken('super_admin');
  });

  afterAll(async () => {
    await tracker.cleanup();
  });

  describe('Validation Partitions (POST /api/v1/users)', () => {
    test('rejects empty payload with 422 validation failure', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/users',
        method: 'POST',
        token,
        body: {},
      });

      expect(res.status).toBe(422);
      expect(res.data.errors).toHaveProperty('name');
      expect(res.data.errors).toHaveProperty('username');
      expect(res.data.errors).toHaveProperty('email');
      expect(res.data.errors).toHaveProperty('role_id');
      expect(res.data.errors).toHaveProperty('organization_id');
    });

    test('rejects malformed email format with 422', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/users',
        method: 'POST',
        token,
        body: {
          name: 'Invalid Email User',
          username: `${runPrefix}_bademail`,
          email: 'not-valid-email-format',
          organization_id: 1,
          role_id: 5,
          password: 'Password123!',
          password_confirmation: 'Password123!',
        },
      });

      expect(res.status).toBe(422);
      expect(res.data.errors).toHaveProperty('email');
    });

    test('rejects password confirmation mismatch with 422', async () => {
      if (!token) return;

      const res = await request({
        path: '/api/v1/users',
        method: 'POST',
        token,
        body: {
          name: 'Mismatch User',
          username: `${runPrefix}_mismatch`,
          email: `${runPrefix}_mismatch@example.gov.et`,
          organization_id: 1,
          role_id: 5,
          password: 'Password123!',
          password_confirmation: 'DifferentPassword456!',
        },
      });

      expect(res.status).toBe(422);
      expect(res.data.errors).toHaveProperty('password');
    });
  });

  describe('Lifecycle and Integrity Guards', () => {
    test('enforces self-deletion guard (authenticated admin cannot delete self)', async () => {
      if (!token) return;

      // Fetch own profile
      const meRes = await request({ path: '/api/v1/auth/me', token });
      if (meRes.status !== 200 || !meRes.data?.data?.id) return;
      const myId = meRes.data.data.id;

      // Attempt self-deletion
      const deleteRes = await request({
        path: `/api/v1/users/${myId}`,
        method: 'DELETE',
        token,
      });

      expect([422, 403, 400]).toContain(deleteRes.status);
    });

    test('creates, manages, resets password, and deletes user when mutations are enabled', async () => {
      if (shouldSkipMutations() || !token) return;

      const username = `${runPrefix}_user`;
      const email = `${username}@example.gov.et`;

      // 1. Create User
      const createRes = await request({
        path: '/api/v1/users',
        method: 'POST',
        token,
        body: {
          name: `Test User ${runPrefix}`,
          username,
          email,
          phone: '+251911000111',
          organization_id: 1,
          role_id: 5, // Staff
          password: 'SecureInitialPassword123!',
          password_confirmation: 'SecureInitialPassword123!',
        },
      });

      expect([201, 200]).toContain(createRes.status);
      const userId = createRes.data?.data?.id;
      expect(userId).toBeDefined();
      tracker.register('user', userId, { token });

      // 2. Duplicate username collision guard
      const dupRes = await request({
        path: '/api/v1/users',
        method: 'POST',
        token,
        body: {
          name: 'Duplicate Attempt',
          username,
          email: `alt_${email}`,
          organization_id: 1,
          role_id: 5,
          password: 'Password123!',
          password_confirmation: 'Password123!',
        },
      });
      expect(dupRes.status).toBe(422);

      // 3. Read detail
      const readRes = await request({
        path: `/api/v1/users/${userId}`,
        token,
      });
      expect(readRes.status).toBe(200);
      expect(readRes.data.data.username).toBe(username);

      // 4. Update
      const updateRes = await request({
        path: `/api/v1/users/${userId}`,
        method: 'PUT',
        token,
        body: {
          name: `Updated Name ${runPrefix}`,
        },
      });
      expect(updateRes.status).toBe(200);

      // 5. Reset user password via admin action
      const resetRes = await request({
        path: `/api/v1/users/${userId}/reset-password`,
        method: 'POST',
        token,
        body: {
          password: 'NewlyAdminResetPassword456!',
          password_confirmation: 'NewlyAdminResetPassword456!',
        },
      });
      expect([200, 204]).toContain(resetRes.status);

      // 6. Delete
      const deleteRes = await request({
        path: `/api/v1/users/${userId}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(deleteRes.status);

      // 7. Verify deleted
      const confirmRes = await request({
        path: `/api/v1/users/${userId}`,
        token,
      });
      expect(confirmRes.status).toBe(404);
    });
  });
});
