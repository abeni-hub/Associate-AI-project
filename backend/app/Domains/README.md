# Domain Architecture

This directory houses the domain-oriented modules of the **Government Citizen Engagement Platform**.

While standard Laravel controllers, routes, and console commands handle the transport layer, all business logic, data models, domain services, actions, and events are organized into coherent domain boundaries.

## Domain Boundaries

1. **Authentication (`app/Domains/Authentication/`)**
   - Sanctum SPA session authentication, login rate limiting, password reset flows, session state.
2. **Authorization (`app/Domains/Authorization/`)**
   - Role-permission checking, policy enforcement, organizational data-scoping logic.
3. **Organizations (`app/Domains/Organizations/`)**
   - Generic organizational hierarchy (`organization_types`, `organizations`, parent-child relationships).
4. **Users (`app/Domains/Users/`)**
   - Administrative and employee accounts, organizational association, lifecycle status.
5. **Services (`app/Domains/Services/`)**
   - Master government service catalog, subservices, ownership, and organization access levels.
6. **Documents (`app/Domains/Documents/`)**
   - Required document management and service-to-document relationships.
7. **ServiceSteps (`app/Domains/ServiceSteps/`)**
   - Room-by-room, step-by-step citizen instructions mapped to services and organizations.
8. **News (`app/Domains/News/`)**
   - Organization-scoped news creation, draft/publishing lifecycle, citizen visibility.
9. **Events (`app/Domains/Events/`)**
   - Scheduled organizational events, calendar details, publishing workflow.
10. **Feedback (`app/Domains/Feedback/`)**
    - Citizen complaints, suggestions, and satisfaction ratings with hierarchical parent-read visibility.
11. **QrCodes (`app/Domains/QrCodes/`)**
    - QR token generation, activation status, public resolution into feedback contexts.
12. **Dashboard (`app/Domains/Dashboard/`)**
    - Role-aware and organization-scoped metrics and reporting queries.
13. **AuditLogs (`app/Domains/AuditLogs/`)**
    - Comprehensive audit trails of administrative and structural mutations.

*Note: Per Phase 1 requirements, domain directories establish architectural boundaries without implementing premature business logic ahead of their assigned phases.*
