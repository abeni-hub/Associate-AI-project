const { request } = require('../support/api-client.cjs');

describe('Public Content and Public Feedback Validation Contracts', () => {
  describe('GET /api/v1/documents', () => {
    test('returns paginated public documents catalog', async () => {
      const response = await request({ path: '/api/v1/documents' });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        errors: null,
      });
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('returns 404 for nonexistent document ID or code', async () => {
      const resById = await request({ path: '/api/v1/documents/99999999' });
      expect(resById.status).toBe(404);
      expect(resById.data.success).toBe(false);

      const resByCode = await request({ path: '/api/v1/documents/nonexistent-doc-slug-xyz' });
      expect(resByCode.status).toBe(404);
      expect(resByCode.data.success).toBe(false);
    });
  });

  describe('GET /api/v1/news', () => {
    test('returns public news articles list', async () => {
      const response = await request({ path: '/api/v1/news' });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        success: true,
        errors: null,
      });
      expect(Array.isArray(response.data.data)).toBe(true);
      for (const item of response.data.data) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        if (item.status) {
          expect(item.status).toBe('published');
        }
      }
    });

    test('returns 404 for nonexistent news ID', async () => {
      const response = await request({ path: '/api/v1/news/99999999' });

      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    });
  });

  describe('POST /api/v1/feedbacks (Public Validation Envelope)', () => {
    test('is accessible without authentication and rejects empty payload with 422', async () => {
      const response = await request({
        path: '/api/v1/feedbacks',
        method: 'POST',
        body: {},
      });

      expect(response.status).toBe(422);
      expect(response.data).toMatchObject({
        success: false,
        message: expect.stringMatching(/validation failed/i),
        data: null,
        errors: expect.any(Object),
      });
      expect(response.data.errors).toHaveProperty('feedback_for_organization');
      expect(response.data.errors).toHaveProperty('feedback_content');
      expect(response.data.errors).toHaveProperty('feedback_type');
    });

    test('rejects invalid feedback_type with 422', async () => {
      const response = await request({
        path: '/api/v1/feedbacks',
        method: 'POST',
        body: {
          feedback_for_organization: 1,
          feedback_content: 'Valid content testing type guard.',
          feedback_type: 'invalid_type_enumeration',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toHaveProperty('feedback_type');
    });

    test('rejects nonexistent organization ID with 422', async () => {
      const response = await request({
        path: '/api/v1/feedbacks',
        method: 'POST',
        body: {
          feedback_for_organization: 99999999,
          feedback_content: 'Targeting non-existent organization.',
          feedback_type: 'feedback',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toHaveProperty('feedback_for_organization');
    });

    test('rejects malformed email and invalid phone format with 422', async () => {
      const response = await request({
        path: '/api/v1/feedbacks',
        method: 'POST',
        body: {
          feedback_for_organization: 1,
          feedback_content: 'Checking email validation format.',
          feedback_type: 'feedback',
          email: 'not-an-email-address',
          phone_number: 'abcde',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toHaveProperty('email');
    });

    test('rejects empty or whitespace-only feedback_content with 422', async () => {
      const response = await request({
        path: '/api/v1/feedbacks',
        method: 'POST',
        body: {
          feedback_for_organization: 1,
          feedback_content: '     ',
          feedback_type: 'feedback',
        },
      });

      expect(response.status).toBe(422);
      expect(response.data.errors).toHaveProperty('feedback_content');
    });

    test('safely handles adversarial hostile content in feedback_content without 500', async () => {
      const hostileBodies = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE feedbacks; --",
        '{{7*7}}',
      ];

      for (const hostileText of hostileBodies) {
        const response = await request({
          path: '/api/v1/feedbacks',
          method: 'POST',
          body: {
            feedback_for_organization: 99999999,
            feedback_content: hostileText,
            feedback_type: 'feedback',
          },
        });
        expect([422, 400]).toContain(response.status);
        expect(response.status).not.toBe(500);
      }
    });
  });
});
