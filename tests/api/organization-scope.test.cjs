const { request } = require('../support/api-client.cjs');
const { getOrganizationId, getPersona } = require('../support/config.cjs');

describe('Organization Data Scoping and Multi-Tenant Isolation', () => {
  const roleTokens = {};
  let orgFixtures = null;

  beforeAll(async () => {
    try {
      orgFixtures = {
        subCity: getOrganizationId('sub_city'),
        woreda: getOrganizationId('woreda'),
        bureau: getOrganizationId('bureau'),
        siblingWoreda: getOrganizationId('sibling_woreda'),
        siblingBureau: getOrganizationId('sibling_bureau'),
        otherSubCity: getOrganizationId('other_sub_city'),
      };
    } catch {
      // Fixture IDs not set in offline test environment
    }

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
        // Personas not configured
      }
    }
  });

  describe('Feedback Scoping Rules', () => {
    test('Super Admin can query feedback across all organizations', async () => {
      if (!roleTokens.super_admin) return;

      const res = await request({
        path: '/api/v1/feedbacks',
        token: roleTokens.super_admin,
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data?.data)).toBe(true);
    });

    test('Woreda Admin cannot view feedback belonging to sibling Woreda', async () => {
      if (!roleTokens.woreda_admin || !orgFixtures?.siblingWoreda) return;

      const res = await request({
        path: '/api/v1/feedbacks',
        token: roleTokens.woreda_admin,
        query: { organization_id: orgFixtures.siblingWoreda },
      });

      // Backend should either reject with 403 or return an empty scoped list
      if (res.status === 200) {
        const items = res.data?.data || [];
        const hasSibling = items.some(
          (f) => (f.feedback_for_organization || f.organization?.id) === orgFixtures.siblingWoreda,
        );
        expect(hasSibling).toBe(false);
      } else {
        expect(res.status).toBe(403);
      }
    });

    test('Bureau Admin cannot view feedback belonging to sibling Bureau or parent Woreda', async () => {
      if (!roleTokens.bureau_admin || !orgFixtures?.siblingBureau) return;

      const res = await request({
        path: '/api/v1/feedbacks',
        token: roleTokens.bureau_admin,
        query: { organization_id: orgFixtures.siblingBureau },
      });

      if (res.status === 200) {
        const items = res.data?.data || [];
        const hasSibling = items.some(
          (f) => (f.feedback_for_organization || f.organization?.id) === orgFixtures.siblingBureau,
        );
        expect(hasSibling).toBe(false);
      } else {
        expect(res.status).toBe(403);
      }
    });
  });

  describe('User Management Scoping Rules', () => {
    test('Sub-City Admin cannot manage or update users outside descendant scope', async () => {
      if (!roleTokens.sub_city_admin || !orgFixtures?.otherSubCity) return;

      const res = await request({
        path: '/api/v1/users',
        token: roleTokens.sub_city_admin,
        query: { organization_id: orgFixtures.otherSubCity },
      });

      if (res.status === 200) {
        const users = res.data?.data || [];
        const hasOther = users.some((u) => u.organization?.id === orgFixtures.otherSubCity);
        expect(hasOther).toBe(false);
      } else {
        expect(res.status).toBe(403);
      }
    });

    test('Woreda Admin cannot create users in another Woreda or Sub-City', async () => {
      if (!roleTokens.woreda_admin || !orgFixtures?.siblingWoreda) return;

      const res = await request({
        path: '/api/v1/users',
        method: 'POST',
        token: roleTokens.woreda_admin,
        body: {
          name: 'Scoped User Test',
          username: 'out.of.scope.user',
          email: 'scoped@sibling.gov.et',
          organization_id: orgFixtures.siblingWoreda,
          role_id: 4, // bureau_admin or staff
          password: 'TemporaryPassword123!',
          password_confirmation: 'TemporaryPassword123!',
        },
      });

      expect([403, 422]).toContain(res.status);
    });
  });

  describe('Organization Hierarchy Structure Guards', () => {
    test('rejects setting invalid parent relationship (e.g. Sub-City parented by Bureau)', async () => {
      if (!roleTokens.super_admin || !orgFixtures?.bureau || !orgFixtures?.subCity) return;

      const res = await request({
        path: `/api/v1/organizations/${orgFixtures.subCity}`,
        method: 'PUT',
        token: roleTokens.super_admin,
        body: {
          parent_id: orgFixtures.bureau,
        },
      });

      expect([422, 400]).toContain(res.status);
    });

    test('Sub-City Admin is forbidden from modifying an organization outside their jurisdiction', async () => {
      if (!roleTokens.sub_city_admin || !orgFixtures?.otherSubCity) return;

      const res = await request({
        path: `/api/v1/organizations/${orgFixtures.otherSubCity}`,
        method: 'PUT',
        token: roleTokens.sub_city_admin,
        body: {
          name: 'Malicious Rename Attempt',
        },
      });

      expect([403, 404]).toContain(res.status);
    });
  });
});
