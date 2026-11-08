const { request } = require('./api-client.cjs');
const { loadE2EConfig, getPersona } = require('./config.cjs');

const runPrefix = `e2e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

class FixtureTracker {
  constructor() {
    this.records = []; // { kind, id, token, path }
  }

  register(kind, id, { token, path } = {}) {
    if (!id) return;
    this.records.push({ kind, id, token, path });
  }

  async cleanup() {
    // Delete in safe reverse dependency order:
    // 1. service steps
    // 2. feedback
    // 3. news
    // 4. users
    // 5. services
    // 6. documents
    // 7. organizations
    const priorityOrder = ['service_step', 'feedback', 'news', 'user', 'service', 'document', 'organization'];

    const sorted = [...this.records].sort((a, b) => {
      const idxA = priorityOrder.indexOf(a.kind);
      const idxB = priorityOrder.indexOf(b.kind);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    const errors = [];
    for (const record of sorted) {
      try {
        let deletePath = record.path;
        if (!deletePath) {
          switch (record.kind) {
            case 'organization':
              deletePath = `/api/v1/organizations/${record.id}`;
              break;
            case 'user':
              deletePath = `/api/v1/users/${record.id}`;
              break;
            case 'service':
              deletePath = `/api/v1/services/${record.id}`;
              break;
            case 'document':
              deletePath = `/api/v1/documents/${record.id}`;
              break;
            case 'news':
              deletePath = `/api/v1/news/${record.id}`;
              break;
            case 'feedback':
              deletePath = `/api/v1/feedbacks/${record.id}`;
              break;
            default:
              break;
          }
        }

        if (deletePath) {
          await request({
            path: deletePath,
            method: 'DELETE',
            token: record.token,
          });
        }
      } catch (err) {
        errors.push({ record, error: err.message });
      }
    }

    this.records = [];
    if (errors.length > 0) {
      console.warn('Fixture cleanup reported warnings for records:', errors);
    }
  }
}

function shouldSkipMutations() {
  try {
    const config = loadE2EConfig();
    return !config.allowMutations;
  } catch {
    return true;
  }
}

async function getAdminToken(role = 'super_admin') {
  try {
    const credentials = getPersona(role);
    const res = await request({
      path: '/api/v1/auth/login',
      method: 'POST',
      body: credentials,
    });
    return res.data?.data?.token || res.data?.meta?.token || null;
  } catch {
    return null;
  }
}

module.exports = {
  FixtureTracker,
  getAdminToken,
  runPrefix,
  shouldSkipMutations,
};
