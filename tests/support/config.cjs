const path = require('node:path');
const { isIP } = require('node:net');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.e2e.local'), quiet: true });

const PERSONAS = Object.freeze({
  super_admin: 'E2E_SUPER_ADMIN',
  sub_city_admin: 'E2E_SUB_CITY_ADMIN',
  woreda_admin: 'E2E_WOREDA_ADMIN',
  bureau_admin: 'E2E_BUREAU_ADMIN',
  staff: 'E2E_STAFF',
});

function fail(message) {
  throw new Error(`E2E configuration error: ${message}`);
}

function parseBaseUrl(name, value) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${name} is required. Copy .env.e2e.example to .env.e2e.local and set it to a local or dedicated staging URL.`);
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    fail(`${name} must be a valid absolute HTTP(S) URL.`);
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    fail(`${name} must be an HTTP(S) URL without embedded credentials.`);
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    fail(`${name} must be an origin URL without a path, query, or fragment.`);
  }

  return { url: url.origin, host: url.hostname.replace(/^\[|\]$/g, '').toLowerCase(), protocol: url.protocol };
}

function isLoopback(host) {
  return host === 'localhost'
    || host.endsWith('.localhost')
    || host === '::1'
    || (isIP(host) === 4 && host.startsWith('127.'));
}

function isProductionLike(host) {
  return /(^|[.-])(prod(?:uction)?|live)([.-]|$)/i.test(host);
}

function loadE2EConfig(env = process.env) {
  const environment = typeof env.E2E_ENV === 'string' ? env.E2E_ENV.trim().toLowerCase() : '';
  if (!['local', 'test', 'staging'].includes(environment)) {
    fail('E2E_ENV must be set to local, test, or staging; production targets are never allowed.');
  }

  const api = parseBaseUrl('E2E_API_URL', env.E2E_API_URL);
  const citizen = parseBaseUrl('E2E_CITIZEN_URL', env.E2E_CITIZEN_URL);
  const portal = parseBaseUrl('E2E_PORTAL_URL', env.E2E_PORTAL_URL);
  const targets = [
    ['E2E_API_URL', api],
    ['E2E_CITIZEN_URL', citizen],
    ['E2E_PORTAL_URL', portal],
  ];

  if (targets.some(([, target]) => isProductionLike(target.host))) {
    fail('production-like hosts are not valid E2E targets.');
  }

  if (environment === 'local' || environment === 'test') {
    for (const [name, target] of targets) {
      if (!isLoopback(target.host)) fail(`${name} must use a loopback host for E2E_ENV=${environment}.`);
    }
  } else {
    const allowedHosts = typeof env.E2E_ALLOWED_HOSTS === 'string'
      ? env.E2E_ALLOWED_HOSTS.split(',').map((host) => host.trim().toLowerCase()).filter(Boolean)
      : [];
    if (allowedHosts.length === 0 || allowedHosts.some((host) => host.includes('*'))) {
      fail('E2E_ALLOWED_HOSTS must list each dedicated non-production staging hostname exactly, separated by commas.');
    }
    for (const [name, target] of targets) {
      if (target.protocol !== 'https:') fail(`${name} must use HTTPS for staging.`);
      if (!allowedHosts.includes(target.host)) fail(`${name} host is not present in E2E_ALLOWED_HOSTS.`);
    }
  }

  return {
    environment,
    apiUrl: api.url,
    citizenUrl: citizen.url,
    portalUrl: portal.url,
    allowMutations: env.E2E_ALLOW_MUTATIONS === 'true',
    runRateLimitTests: env.E2E_RUN_RATE_LIMIT_TESTS === 'true',
  };
}

function getPersona(name, env = process.env) {
  const prefix = PERSONAS[name];
  if (!prefix) fail(`Unknown E2E persona "${name}". Expected one of: ${Object.keys(PERSONAS).join(', ')}.`);

  const usernameName = `${prefix}_USERNAME`;
  const passwordName = `${prefix}_PASSWORD`;
  const username = env[usernameName];
  const password = env[passwordName];
  if (typeof username !== 'string' || username.trim() === '' || typeof password !== 'string' || password.trim() === '') {
    fail(`Set ${usernameName} and ${passwordName} in .env.e2e.local for the dedicated non-production account.`);
  }

  return { username: username.trim(), password };
}

function getOrganizationId(name, env = process.env) {
  const keys = {
    sub_city: 'E2E_SUB_CITY_ORG_ID',
    woreda: 'E2E_WOREDA_ORG_ID',
    bureau: 'E2E_BUREAU_ORG_ID',
    sibling_woreda: 'E2E_SIBLING_WOREDA_ORG_ID',
    sibling_bureau: 'E2E_SIBLING_BUREAU_ORG_ID',
    other_sub_city: 'E2E_OTHER_SUB_CITY_ORG_ID',
  };
  const key = keys[name];
  if (!key) fail(`Unknown organization fixture "${name}".`);
  const value = env[key];
  const id = typeof value === 'string' ? Number(value) : NaN;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(id)) {
    fail(`Set ${key} to the ID of the dedicated non-production organization fixture.`);
  }
  return id;
}

module.exports = { getOrganizationId, getPersona, loadE2EConfig };
