const { request } = require('../support/api-client.cjs');
const { getPersona, loadE2EConfig } = require('../support/config.cjs');

describe('Authentication and Session Management Contracts', () => {
  let superAdminToken = null;

  beforeAll(async () => {
    // Attempt login if super_admin credentials are provided in env
    try {
      const credentials = getPersona('super_admin');
      const res = await request({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: credentials,
      });
      if (res.status === 200 && (res.data?.data?.token || res.data?.meta?.token)) {
        superAdminToken = res.data?.data?.token || res.data?.meta?.token;
      }
    } catch {
      // Credentials not configured in dry/unit runs
    }
  });

  describe('POST /api/v1/auth/login', () => {
    test('rejects empty request body with 422 validation failure', async () => {
      const response = await request({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: {},
      });

      expect(response.status).toBe(422);
      expect(response.data).toMatchObject({
        success: false,
        data: null,
      });
      expect(response.data.errors).toBeDefined();
    });

    test('rejects whitespace-only credentials with 422 validation failure', async () => {
      const response = await request({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: {
          username: '     ',
          password: '     ',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data.success).toBe(false);
    });

    test('rejects missing password with 422 validation failure', async () => {
      const response = await request({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: { username: 'test.admin' },
      });

      expect(response.status).toBe(422);
      expect(response.data.success).toBe(false);
    });

    test('rejects invalid or non-existent credentials with 422 and standard login error', async () => {
      const response = await request({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: {
          username: 'definitely.nonexistent.user.e2e',
          password: 'WrongPassword123!',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data).toMatchObject({
        success: false,
        data: null,
        errors: expect.objectContaining({
          login: expect.any(Array),
        }),
      });
    });

    test('authenticates valid credentials and returns Bearer token and profile', async () => {
      if (!superAdminToken) return; // Skip if credentials not supplied

      const credentials = getPersona('super_admin');
      const response = await request({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: credentials,
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        errors: null,
      });
      const token = response.data?.data?.token || response.data?.meta?.token;
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    test('returns 401 Unauthenticated when request has no token', async () => {
      const response = await request({ path: '/api/v1/auth/me' });

      expect(response.status).toBe(401);
      expect(response.data).toMatchObject({
        success: false,
        message: expect.stringMatching(/unauthenticated/i),
      });
    });

    test('returns 401 Unauthenticated when token is malformed or forged', async () => {
      const response = await request({
        path: '/api/v1/auth/me',
        token: 'forged-invalid-bearer-token-12345',
      });

      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    });

    test('returns authenticated profile when valid token is supplied', async () => {
      if (!superAdminToken) return;

      const response = await request({
        path: '/api/v1/auth/me',
        token: superAdminToken,
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          username: expect.any(String),
          role: expect.objectContaining({
            slug: 'super_admin',
          }),
        }),
      });
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    test('returns 401 when unauthenticated', async () => {
      const response = await request({
        path: '/api/v1/auth/logout',
        method: 'POST',
      });

      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    });

    test('revokes token upon logout so subsequent /auth/me call returns 401', async () => {
      let credentials;
      try {
        credentials = getPersona('super_admin');
      } catch {
        return; // Credentials not configured
      }

      // Login to obtain a dedicated disposable session token
      const loginRes = await request({
        path: '/api/v1/auth/login',
        method: 'POST',
        body: credentials,
      });
      if (loginRes.status !== 200) return;

      const sessionToken = loginRes.data?.data?.token || loginRes.data?.meta?.token;
      expect(sessionToken).toBeDefined();

      // Logout with the session token
      const logoutRes = await request({
        path: '/api/v1/auth/logout',
        method: 'POST',
        token: sessionToken,
      });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.data.success).toBe(true);

      // Verify immediate token revocation
      const meRes = await request({
        path: '/api/v1/auth/me',
        token: sessionToken,
      });

      expect(meRes.status).toBe(401);
    });
  });

  describe('PUT /api/v1/auth/change-password', () => {
    test('returns 401 when unauthenticated', async () => {
      const response = await request({
        path: '/api/v1/auth/change-password',
        method: 'PUT',
        body: {
          current_password: 'TestPassword123!',
          new_password: 'NewTestPassword456!',
          new_password_confirmation: 'NewTestPassword456!',
        },
      });

      expect(response.status).toBe(401);
    });

    test('rejects incorrect current password with 422', async () => {
      if (!superAdminToken) return;

      const response = await request({
        path: '/api/v1/auth/change-password',
        method: 'PUT',
        token: superAdminToken,
        body: {
          current_password: 'WrongCurrentPassword999!',
          new_password: 'NewValidPassword123!',
          new_password_confirmation: 'NewValidPassword123!',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toHaveProperty('current_password');
    });

    test('rejects password confirmation mismatch with 422', async () => {
      if (!superAdminToken) return;

      const response = await request({
        path: '/api/v1/auth/change-password',
        method: 'PUT',
        token: superAdminToken,
        body: {
          current_password: 'AnyPassword123!',
          new_password: 'NewValidPassword123!',
          new_password_confirmation: 'MismatchPassword456!',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toHaveProperty('new_password');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    test('rejects empty request body with 422', async () => {
      const response = await request({
        path: '/api/v1/auth/forgot-password',
        method: 'POST',
        body: {},
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toHaveProperty('email');
    });

    test('rejects malformed email format with 422', async () => {
      const response = await request({
        path: '/api/v1/auth/forgot-password',
        method: 'POST',
        body: { email: 'not-an-email' },
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toHaveProperty('email');
    });

    test('returns generic 200 response even for non-existent email to prevent enumeration', async () => {
      const response = await request({
        path: '/api/v1/auth/forgot-password',
        method: 'POST',
        body: { email: 'unregistered.user.probe@example.gov.et' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        message: expect.stringMatching(/if your email address exists/i),
      });
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    test('rejects empty or missing parameters with 422', async () => {
      const response = await request({
        path: '/api/v1/auth/reset-password',
        method: 'POST',
        body: {},
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toBeDefined();
    });

    test('rejects invalid or expired reset token with 422', async () => {
      const response = await request({
        path: '/api/v1/auth/reset-password',
        method: 'POST',
        body: {
          token: 'invalid-nonexistent-token',
          email: 'test@example.gov.et',
          password: 'NewSecurePassword123!',
          password_confirmation: 'NewSecurePassword123!',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data.success).toBe(false);
    });

    test('rejects password confirmation mismatch with 422', async () => {
      const response = await request({
        path: '/api/v1/auth/reset-password',
        method: 'POST',
        body: {
          token: 'some-token',
          email: 'test@example.gov.et',
          password: 'NewSecurePassword123!',
          password_confirmation: 'DifferentPassword456!',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toHaveProperty('password');
    });
  });

  describe('Gated Login Rate Limiting (E2E_RUN_RATE_LIMIT_TESTS)', () => {
    test('enforces rate limits on repeated failed attempts when enabled', async () => {
      let runRateLimit = false;
      try {
        const config = loadE2EConfig();
        runRateLimit = config.runRateLimitTests;
      } catch {
        // Not configured
      }

      if (!runRateLimit) {
        return; // Safe default: do not lock out accounts or flood endpoints
      }

      const attempts = [];
      // Max 6 attempts to trigger standard 5/min rate limit
      for (let i = 0; i < 6; i++) {
        attempts.push(
          await request({
            path: '/api/v1/auth/login',
            method: 'POST',
            body: {
              username: 'rate.limit.target',
              password: 'WrongPassword!',
            },
          }),
        );
      }

      const hasRateLimitResponse = attempts.some((r) => r.status === 429);
      expect(hasRateLimitResponse).toBe(true);
    });
  });
});
