const { getOrganizationId, getPersona, loadE2EConfig } = require('./config.cjs');
const { request } = require('./api-client.cjs');

function localEnv(overrides = {}) {
  return {
    E2E_ENV: 'local',
    E2E_API_URL: 'http://127.0.0.1:8000',
    E2E_CITIZEN_URL: 'http://localhost:5173',
    E2E_PORTAL_URL: 'http://127.0.0.1:5174',
    ...overrides,
  };
}

describe('loadE2EConfig', () => {
  test.each(['E2E_API_URL', 'E2E_CITIZEN_URL', 'E2E_PORTAL_URL'])(
    'requires an explicit %s',
    (name) => {
      const env = localEnv();
      delete env[name];

      expect(() => loadE2EConfig(env)).toThrow(name);
    },
  );

  test('requires an explicit non-production environment', () => {
    expect(() => loadE2EConfig(localEnv({ E2E_ENV: '' }))).toThrow(/E2E_ENV/);
    expect(() => loadE2EConfig(localEnv({ E2E_ENV: 'production' }))).toThrow(/local, test, or staging/);
  });

  test.each([
    ['E2E_API_URL', 'not a URL'],
    ['E2E_CITIZEN_URL', 'file:///tmp/site'],
    ['E2E_PORTAL_URL', 'https://user:secret@example.test'],
  ])('rejects malformed or unsafe %s values', (name, value) => {
    expect(() => loadE2EConfig(localEnv({ [name]: value }))).toThrow(name);
  });

  test('rejects production-looking hosts even when labelled staging', () => {
    const env = {
      E2E_ENV: 'staging',
      E2E_API_URL: 'https://api.production.example.test',
      E2E_CITIZEN_URL: 'https://citizen.example.test',
      E2E_PORTAL_URL: 'https://portal.example.test',
      E2E_ALLOWED_HOSTS: 'api.production.example.test,citizen.example.test,portal.example.test',
    };

    expect(() => loadE2EConfig(env)).toThrow(/production-like host/);
  });

  test('limits local and test targets to loopback hosts', () => {
    expect(() => loadE2EConfig(localEnv({ E2E_API_URL: 'https://api.example.test' }))).toThrow(/loopback/);
    expect(() => loadE2EConfig(localEnv({ E2E_API_URL: 'http://127.attacker.example.test' }))).toThrow(/loopback/);
  });

  test('requires HTTPS and an exact host allowlist for staging', () => {
    const env = {
      E2E_ENV: 'staging',
      E2E_API_URL: 'https://api.staging.example.test',
      E2E_CITIZEN_URL: 'https://citizen.staging.example.test',
      E2E_PORTAL_URL: 'https://portal.staging.example.test',
      E2E_ALLOWED_HOSTS: 'api.staging.example.test,citizen.staging.example.test',
    };

    expect(() => loadE2EConfig(env)).toThrow(/E2E_ALLOWED_HOSTS/);
    expect(() => loadE2EConfig({ ...env, E2E_PORTAL_URL: 'http://portal.staging.example.test' })).toThrow(/HTTPS/);
  });

  test('accepts explicitly allowlisted non-production staging hosts', () => {
    const env = {
      E2E_ENV: 'staging',
      E2E_API_URL: 'https://api.staging.example.test/',
      E2E_CITIZEN_URL: 'https://citizen.staging.example.test',
      E2E_PORTAL_URL: 'https://portal.staging.example.test',
      E2E_ALLOWED_HOSTS: 'api.staging.example.test,citizen.staging.example.test,portal.staging.example.test',
    };

    expect(loadE2EConfig(env)).toMatchObject({
      environment: 'staging',
      apiUrl: 'https://api.staging.example.test',
      citizenUrl: 'https://citizen.staging.example.test',
      portalUrl: 'https://portal.staging.example.test',
    });
  });

  test('keeps state-changing suites disabled unless explicitly enabled', () => {
    expect(loadE2EConfig(localEnv())).toMatchObject({ allowMutations: false, runRateLimitTests: false });
    expect(loadE2EConfig(localEnv({ E2E_ALLOW_MUTATIONS: 'true', E2E_RUN_RATE_LIMIT_TESTS: 'true' })))
      .toMatchObject({ allowMutations: true, runRateLimitTests: true });
    expect(loadE2EConfig(localEnv({ E2E_ALLOW_MUTATIONS: 'yes' })).allowMutations).toBe(false);
  });
});

describe('getPersona', () => {
  test('fails with direct setup guidance when a required role account is missing', () => {
    expect(() => getPersona('super_admin', {})).toThrow(/E2E_SUPER_ADMIN_USERNAME and E2E_SUPER_ADMIN_PASSWORD/);
    expect(() => getPersona('super_admin', {
      E2E_SUPER_ADMIN_USERNAME: 'e2e-super',
      E2E_SUPER_ADMIN_PASSWORD: '   ',
    })).toThrow(/E2E_SUPER_ADMIN_USERNAME and E2E_SUPER_ADMIN_PASSWORD/);
  });

  test('returns credentials only for a known, fully configured role', () => {
    expect(getPersona('bureau_admin', {
      E2E_BUREAU_ADMIN_USERNAME: 'e2e-bureau',
      E2E_BUREAU_ADMIN_PASSWORD: 'test-only-password',
    })).toEqual({ username: 'e2e-bureau', password: 'test-only-password' });
  });

  test('rejects unknown role names', () => {
    expect(() => getPersona('events_admin', {})).toThrow(/Unknown E2E persona/);
  });
});

describe('getOrganizationId', () => {
  test('returns a configured positive numeric organization ID', () => {
    expect(getOrganizationId('sibling_bureau', { E2E_SIBLING_BUREAU_ORG_ID: '42' })).toBe(42);
  });

  test.each(['', '0', '-2', '3x'])('rejects invalid organization fixture IDs such as %j', (value) => {
    expect(() => getOrganizationId('bureau', { E2E_BUREAU_ORG_ID: value })).toThrow(/E2E_BUREAU_ORG_ID/);
  });

  test('rejects IDs outside JavaScript integer precision', () => {
    expect(() => getOrganizationId('bureau', { E2E_BUREAU_ORG_ID: '9007199254740993' }))
      .toThrow(/E2E_BUREAU_ORG_ID/);
  });
});

describe('request', () => {
  const originalEnvironment = {};
  let fetchSpy;

  beforeAll(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
    for (const name of ['E2E_ENV', 'E2E_API_URL', 'E2E_CITIZEN_URL', 'E2E_PORTAL_URL']) {
      originalEnvironment[name] = process.env[name];
    }
    process.env.E2E_ENV = 'local';
    process.env.E2E_API_URL = 'http://127.0.0.1:8000';
    process.env.E2E_CITIZEN_URL = 'http://127.0.0.1:5173';
    process.env.E2E_PORTAL_URL = 'http://127.0.0.1:5174';
  });

  afterAll(async () => {
    fetchSpy.mockRestore();
    for (const [name, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  beforeEach(() => fetchSpy.mockReset());

  test('preserves JSON error status, headers, parsed data, and raw response body', async () => {
    const payload = { success: false, message: 'Validation failed.' };
    fetchSpy.mockResolvedValue(new Response(JSON.stringify(payload), {
      status: 422,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    }));

    const response = await request({ path: '/api/v1/error' });

    expect(response.status).toBe(422);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.data).toEqual(payload);
    expect(response.raw).toBe(JSON.stringify(payload));
    expect(fetchSpy.mock.calls[0][0].toString()).toBe('http://127.0.0.1:8000/api/v1/error');
  });

  test('preserves non-JSON error bodies without inventing parsed data', async () => {
    fetchSpy.mockResolvedValue(new Response('upstream unavailable', {
      status: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    }));

    const response = await request({ path: '/api/v1/non-json' });

    expect(response.status).toBe(502);
    expect(response.headers['content-type']).toMatch(/text\/plain/);
    expect(response.data).toBeNull();
    expect(response.raw).toBe('upstream unavailable');
  });

  test('sends bearer tokens, JSON payloads, and repeated query values', async () => {
    fetchSpy.mockImplementation(async (url, init) => {
      const parsedUrl = new URL(url);
      return new Response(JSON.stringify({
        method: init.method,
        authorization: new Headers(init.headers).get('authorization'),
        body: JSON.parse(init.body),
        tags: parsedUrl.searchParams.getAll('tag'),
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    });

    const response = await request({
      path: '/api/v1/error',
      method: 'POST',
      token: 'test-token',
      body: { message: 'hello' },
      query: { tag: ['one', 'two'], empty: '', omit: null },
    });

    expect(response.data).toMatchObject({
      method: 'POST',
      authorization: 'Bearer test-token',
      body: { message: 'hello' },
      tags: ['one', 'two'],
    });
  });

  test('rejects absolute or host-relative paths that could escape the configured API host', async () => {
    await expect(request({ path: 'https://elsewhere.example.test/api/v1/health' })).rejects.toThrow(/relative API path/);
    await expect(request({ path: '//elsewhere.example.test/api/v1/health' })).rejects.toThrow(/relative API path/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('retains malformed JSON for diagnostics instead of throwing while parsing', async () => {
    fetchSpy.mockResolvedValue(new Response('{not-json', {
      status: 500,
      headers: { 'content-type': 'application/json' },
    }));

    const response = await request({ path: '/api/v1/broken' });

    expect(response).toMatchObject({ status: 500, data: null, raw: '{not-json' });
  });
});
