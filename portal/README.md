# CivicLink Ethiopia — Admin Portal

Role-aware administration portal for the Unified Citizen Engagement & Service Information Platform. The interface follows the public client app's deep teal, ivory, sage and brass theme.

## Workspaces

- **Super admin:** oversee sub-cities, administrator accounts, platform feedback and activity.
- **Sub-city admin:** manage bureau accounts, shared service standards, feedback, news and events.
- **Bureau admin:** maintain room-by-room service routes, respond to feedback and share office QR codes.

The sign-in screen includes demo workspaces for each role. The current app uses illustrative sample data and in-memory demo state; it does not yet connect to authentication, a database or an API. The QR codes encode sample citizen feedback URLs.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run build` to create a production bundle and `npm run lint` for static checks.
