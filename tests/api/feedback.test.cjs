const { request } = require('../support/api-client.cjs');
const { FixtureTracker, getAdminToken, runPrefix, shouldSkipMutations } = require('../support/fixtures.cjs');

describe('Citizen Feedback Lifecycle, Complaint Tracking, and Administrative Actions', () => {
  const tracker = new FixtureTracker();
  let token = null;

  beforeAll(async () => {
    token = await getAdminToken('super_admin');
  });

  afterAll(async () => {
    await tracker.cleanup();
  });

  describe('Citizen Feedback and Complaint Workflow', () => {
    test('submits complaint, tracks number, reviews, responds, and cleans up', async () => {
      if (shouldSkipMutations() || !token) return;

      // 1. Public Submission of a Complaint
      const submitRes = await request({
        path: '/api/v1/feedbacks',
        method: 'POST',
        body: {
          feedback_for_organization: 1,
          feedback_type: 'complaint',
          feedback_content: `Service queue delay complaint during ${runPrefix}`,
          full_name: 'Abebe E2E Citizen',
          email: `${runPrefix}_citizen@example.et`,
          phone_number: '+251911998877',
        },
      });

      expect([201, 200]).toContain(submitRes.status);
      const feedbackId = submitRes.data?.data?.id;
      const trackingNumber = submitRes.data?.data?.tracking_number;
      expect(feedbackId).toBeDefined();
      expect(trackingNumber).toBeDefined();
      tracker.register('feedback', feedbackId, { token });

      // 2. Administrative Review via Authenticated Endpoint
      const reviewRes = await request({
        path: `/api/v1/feedbacks/${feedbackId}`,
        token,
      });
      expect(reviewRes.status).toBe(200);
      expect(reviewRes.data.data.tracking_number).toBe(trackingNumber);

      // 3. Administrative Response / Status Update
      const respondRes = await request({
        path: `/api/v1/feedbacks/${feedbackId}/respond`,
        method: 'POST',
        token,
        body: {
          response_content: 'Your complaint has been investigated and resolved.',
          status: 'resolved',
        },
      });
      expect([200, 201, 204]).toContain(respondRes.status);

      // 4. Delete Feedback Record
      const deleteRes = await request({
        path: `/api/v1/feedbacks/${feedbackId}`,
        method: 'DELETE',
        token,
      });
      expect([200, 204]).toContain(deleteRes.status);
    });
  });
});
