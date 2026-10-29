const { request } = require('../support/api-client.cjs');
const { getPersona } = require('../support/config.cjs');

describe('Role-Based Access Control and Permission Gates', () => {
  const roleTokens = {};
  const roles = ['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin', 'staff'];

  beforeAll(async () => {
    for (const role of roles) {
      try {
        const credentials = getPersona(role);
        const res = await request({
          path: '/api/v1/auth/login',
          method: 'POST',
          body: credentials,
        });
        if (res.status === 200 && (res.data?.data?.token || res.data?.meta?.token)) {
          roleTokens[role] = res.data?.data?.token || res.data?.meta?.token;
        }
      } catch {
        // Personas not configured in offline/dry environment
      }
    }
  });

  describe('Unauthenticated Protection on Gated Endpoints', () => {
    const protectedEndpoints = [
      { path: '/api/v1/roles', method: 'GET' },
      { path: '/api/v1/permissions', method: 'GET' },
      { path: '/api/v1/organizations', method: 'GET' },
      { path: '/api/v1/users', method: 'GET' },
      { path: '/api/v1/feedbacks', method: 'GET' },
      { path: '/api/v1/dashboard/overview', method: 'GET' },
    ];

    test.each(protectedEndpoints)(
      'rejects unauthenticated request to %s with 401',
      async ({ path, method }) => {
        const response = await request({ path, method });
        expect(response.status).toBe(401);
        expect(response.data).toMatchObject({
          success: false,
          message: expect.stringMatching(/unauthenticated/i),
        });
      },
    );
  });

  describe('System Role and Permission Management (roles.view & roles.manage)', () => {
    test('Super Admin has access to view roles and permissions', async () => {
      if (!roleTokens.super_admin) return;

      const rolesRes = await request({ path: '/api/v1/roles', token: roleTokens.super_admin });
      expect(rolesRes.status).toBe(200);
      expect(Array.isArray(rolesRes.data?.data)).toBe(true);

      const permsRes = await request({ path: '/api/v1/permissions', token: roleTokens.super_admin });
      expect(permsRes.status).toBe(200);
      expect(Array.isArray(permsRes.data?.data)).toBe(true);
    });

    test.each(['sub_city_admin', 'woreda_admin', 'bureau_admin', 'staff'])(
      '%s is forbidden (403) from accessing roles and permissions',
      async (role) => {
        if (!roleTokens[role]) return;

        const rolesRes = await request({ path: '/api/v1/roles', token: roleTokens[role] });
        expect(rolesRes.status).toBe(403);
        expect(rolesRes.data.success).toBe(false);

        const permsRes = await request({ path: '/api/v1/permissions', token: roleTokens[role] });
        expect(permsRes.status).toBe(403);
        expect(permsRes.data.success).toBe(false);
      },
    );
  });

  describe('Organization Structure Viewing (organizations.view)', () => {
    test.each(['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin'])(
      '%s can view organizations list and hierarchy tree',
      async (role) => {
        if (!roleTokens[role]) return;

        const res = await request({ path: '/api/v1/organizations', token: roleTokens[role] });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);

        const treeRes = await request({ path: '/api/v1/organizations/tree', token: roleTokens[role] });
        expect(treeRes.status).toBe(200);
        expect(treeRes.data.success).toBe(true);
      },
    );

    test('Staff role is forbidden (403) from viewing organization list or tree', async () => {
      if (!roleTokens.staff) return;

      const res = await request({ path: '/api/v1/organizations', token: roleTokens.staff });
      expect(res.status).toBe(403);

      const treeRes = await request({ path: '/api/v1/organizations/tree', token: roleTokens.staff });
      expect(treeRes.status).toBe(403);
    });
  });

  describe('User Administration Viewing (users.view)', () => {
    test.each(['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin'])(
      '%s has permission to view scoped users',
      async (role) => {
        if (!roleTokens[role]) return;

        const res = await request({ path: '/api/v1/users', token: roleTokens[role] });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
      },
    );

    test('Staff role is forbidden (403) from listing users', async () => {
      if (!roleTokens.staff) return;

      const res = await request({ path: '/api/v1/users', token: roleTokens.staff });
      expect(res.status).toBe(403);
    });
  });

  describe('Administrative Service Creation (services.create)', () => {
    test.each(['sub_city_admin', 'woreda_admin', 'bureau_admin', 'staff'])(
      '%s cannot create services (403)',
      async (role) => {
        if (!roleTokens[role]) return;

        const res = await request({
          path: '/api/v1/services',
          method: 'POST',
          token: roleTokens[role],
          body: {
            name: 'Unauthorized Service Attempt',
            code: 'unauthorized-service',
            description: 'Testing RBAC service creation block',
          },
        });

        expect(res.status).toBe(403);
      },
    );
  });
});
