/**
 * CMS Dev Middleware (Disabled)
 * CMS landing page operations now communicate directly with the Laravel database.
 */
export function cmsDevMiddleware() {
  return {
    name: 'cms-landing-sync-middleware-disabled',
  };
}
