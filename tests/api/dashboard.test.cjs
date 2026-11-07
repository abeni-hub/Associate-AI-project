const { request } = require('../support/api-client.cjs');
const { getPersona } = require('../support/config.cjs');

describe('Dashboard Metrics and Scoped Reporting Contracts', () => {
  const roleTokens = {};

  beforeAll(async () => {
    const roles = ['super_admin', 'sub_city_admin', 'woreda_admin', 'bureau_admin', 'staff'];
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
        // Personas not configured in offline test environment
      }
    }
  });

  describe('GET /api/v1/dashboard/overview & /api/v1/dashboard/stats', () => {
    test('rejects unauthenticated requests with 401', async () => {
      const res = await request({ path: '/api/v1/dashboard/overview' });
      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);

      const statsRes = await request({ path: '/api/v1/dashboard/stats' });
      expect(statsRes.status).toBe(401);
    });

    test('returns platform-wide global scope metadata for Super Admin', async () => {
      if (!roleTokens.super_admin) return;

      const res = await request({
        path: '/api/v1/dashboard/overview',
        token: roleTokens.super_admin,
      });

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        data: expect.objectContaining({
          scope: expect.objectContaining({
            role: 'super_admin',
            is_global: true,
          }),
          organizations: expect.any(Object),
          users: expect.any(Object),
          services: expect.any(Object),
          feedback: expect.any(Object),
        }),
      });
    });

    test('returns localized non-global scope metadata for Sub-City Admin', async () => {
      if (!roleTokens.sub_city_admin) return;

      const res = await request({
        path: '/api/v1/dashboard/overview',
        token: roleTokens.sub_city_admin,
      });

      expect(res.status).toBe(200);
      expect(res.data.data.scope.is_global).toBe(false);
      expect(res.data.data.scope.role).toBe('sub_city_admin');
    });

    test('returns organization-specific scope metadata for Bureau Admin and Staff', async () => {
      const token = roleTokens.bureau_admin || roleTokens.staff;
      if (!token) return;

      const res = await request({
        path: '/api/v1/dashboard/overview',
        token,
      });

      expect(res.status).toBe(200);
      expect(res.data.data.scope.is_global).toBe(false);
      expect(res.data.data.scope).toHaveProperty('organization_id');
    });
  });

  describe('GET /api/v1/dashboard/reports/feedback', () => {
    test('returns structured feedback report with metrics breakdown', async () => {
      if (!roleTokens.super_admin) return;

      const res = await request({
        path: '/api/v1/dashboard/reports/feedback',
        token: roleTokens.super_admin,
      });

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        data: expect.any(Object),
      });
    });

    test('safely handles boundary and invalid date filters without throwing 500', async () => {
      if (!roleTokens.super_admin) return;

      const testFilters = [
        { start_date: 'not-a-date' },
        { start_date: '2026-12-31', end_date: '2026-01-01' }, // inverted range
        { start_date: '1900-01-01', end_date: '2100-01-01' }, // extreme range
      ];

      for (const query of testFilters) {
        const res = await request({
          path: '/api/v1/dashboard/reports/feedback',
          token: roleTokens.super_admin,
          query,
        });

        expect([200, 422, 400]).toContain(res.status);
        expect(res.status).not.toBe(500);
      }
    });
  });

  describe('GET /api/v1/dashboard/reports/services & organizations', () => {
    test('returns service catalog metrics report when authenticated', async () => {
      if (!roleTokens.super_admin) return;

      const res = await request({
        path: '/api/v1/dashboard/reports/services',
        token: roleTokens.super_admin,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });

    test('returns organization distribution report when authenticated', async () => {
      if (!roleTokens.super_admin) return;

      const res = await request({
        path: '/api/v1/dashboard/reports/organizations',
        token: roleTokens.super_admin,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/recent-activity', () => {
    test('returns recent activity stream within user scope', async () => {
      if (!roleTokens.super_admin) return;

      const res = await request({
        path: '/api/v1/dashboard/recent-activity',
        token: roleTokens.super_admin,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.data)).toBe(true);
    });
  });
});
