# Civic Link

Civic Link is a Government Citizen Engagement Platform.

The project is organized as a monorepo containing three applications:

## Project Structure

```text
civic-link/
├── backend/    # Laravel 13 REST API
├── client/     # React citizen-facing application
├── portal/     # React government administration portal
└── README.md
```

## Applications

### Backend
- Laravel 13
- PostgreSQL
- Laravel Sanctum
- REST API with versioning (`/api/v1`)

### Client
- React application for citizens.

### Portal
- React application for government administrators and staff.

## Development

Each application has its own dependencies and setup instructions. Refer to its respective README file.

## Collaboration

Contributors should use feature branches and submit Pull Requests for review before merging changes into the shared `main` branch.
