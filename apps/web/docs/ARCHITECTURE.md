# Application Architecture

## 📁 Directory Structure

```
app/
├── (auth)/                    # Authentication pages (login, register)
│   ├── login/
│   ├── register/
│   └── forgot-password/
│
├── admin/                     # Admin-only features (protected)
│   ├── layout.tsx            # Admin layout with permission checks
│   ├── users/                # User management
│   │   ├── page.tsx          # List users
│   │   ├── create/           # Create new user
│   │   └── [id]/edit/        # Edit user
│   ├── roles/                # Role management
│   ├── permissions/          # Permission management
│   └── settings/             # Admin settings
│
├── dashboard/                # User dashboard features
│   ├── layout.tsx            # Dashboard layout
│   ├── page.tsx              # Dashboard home
│   ├── activity/             # Activity logs viewer
│   ├── analytics/            # Analytics dashboard
│   ├── projects/             # Projects management
│   └── settings/             # User settings
│
├── api/                      # Backend API routes
│   ├── auth/                 # Authentication endpoints
│   ├── users/                # User management API
│   ├── roles/                # Role management API
│   ├── permissions/          # Permissions API
│   └── audit-logs/           # Audit logging API
│
├── components/
│   ├── auth/                 # Auth-related components
│   ├── guards/               # Permission & route guards
│   ├── layouts/              # Layout components (Header, Sidenav, Footer)
│   └── ui/                   # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── EmptyState.tsx
│       ├── ErrorDisplay.tsx
│       ├── LoadingSkeleton.tsx
│       └── PageHeader.tsx
│
lib/
├── api/                      # API client configuration
├── contexts/                 # React contexts (AuthContext)
├── db/                       # Database models & connection
│   ├── models/
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   ├── Permission.ts
│   │   ├── Session.ts
│   │   └── AuditLog.ts
│   └── mongodb.ts
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts
│   ├── usePermission.ts
│   ├── useRole.ts
│   └── useApiData.ts
├── middleware/               # API middleware
│   ├── auth.middleware.ts
│   ├── permission.middleware.ts
│   └── rateLimit.middleware.ts
├── repositories/             # Data access layer
│   ├── user.repository.ts
│   ├── role.repository.ts
│   ├── permission.repository.ts
│   ├── session.repository.ts
│   └── auditLog.repository.ts
├── services/                 # Business logic layer
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── role.service.ts
│   └── auditLog.service.ts
└── utils/                    # Utility functions
    ├── jwt.ts
    ├── cookies.ts
    ├── password.ts
    ├── validation.ts
    ├── errors.ts
    ├── auditLogger.ts
    └── api-response.ts

config/
├── permissions.ts            # Permission definitions
├── roles.ts                  # Default roles
└── routes.ts                 # Route permissions

types/
├── auth.types.ts             # Authentication types
├── user.types.ts             # User types
├── role.types.ts             # Role types
├── permission.types.ts       # Permission types
├── api.types.ts              # API types
└── ui.types.ts               # UI component types
```

## 🏗️ Architecture Layers

### 1. Presentation Layer (UI)
- **React Components**: Pages, layouts, and reusable UI components
- **Client-Side Logic**: Form handling, state management, validation
- **Routing**: Next.js App Router with nested layouts

### 2. API Layer (Backend)
- **Route Handlers**: Next.js API routes
- **Middleware**: Authentication, authorization, rate limiting
- **Error Handling**: Centralized error handling with custom error types

### 3. Business Logic Layer
- **Services**: Business rules and orchestration
- **Repositories**: Data access and queries
- **Models**: Database schemas and document methods

### 4. Data Layer
- **MongoDB**: Document database
- **Mongoose**: ODM for schema validation and queries
- **Indexes**: Optimized for common queries

## 🔐 Security Architecture

### Authentication Flow
```
Client → Login Request → API Route → Auth Service
                                    ↓
                            Validate Credentials
                                    ↓
                            Generate JWT Tokens
                                    ↓
                            Set httpOnly Cookies
                                    ↓
                            Return User + Permissions
```

### Authorization Layers
1. **Route Middleware**: Protects routes before they load
2. **API Middleware**: Validates tokens and permissions
3. **Component Guards**: Conditionally renders UI elements
4. **Service Layer**: Validates permissions before operations

### Token Strategy
- **Access Token**: 15 minutes (short-lived)
- **Refresh Token**: 7-30 days (long-lived)
- **Storage**: httpOnly cookies (XSS protection)
- **Rotation**: Automatic refresh on expiration

## 📊 Data Flow

### User Action → API → Database

```
Component
    ↓ (axios request)
API Route
    ↓ (authenticate)
Middleware
    ↓ (authorize)
Permission Check
    ↓ (validate & process)
Service Layer
    ↓ (query/mutate)
Repository Layer
    ↓ (execute)
Database
```

### Response Flow

```
Database
    ↓ (return documents)
Repository
    ↓ (transform to DTOs)
Service
    ↓ (apply business logic)
API Route
    ↓ (format response)
Component
    ↓ (update UI)
User
```

## 🎨 UI Component Patterns

### Shared Components
All pages use standardized components:
- **PageHeader**: Consistent page titles and actions
- **Card**: Wrapper for content sections
- **Button**: Standardized buttons with variants
- **LoadingSkeleton**: Loading states
- **EmptyState**: No-data states
- **ErrorDisplay**: Error messages

### Custom Hooks
- **useApiData**: Fetch data with loading/error states
- **useAuth**: Access authentication context
- **usePermission**: Check user permissions
- **useRole**: Check user roles

## 🔄 State Management

### Global State
- **AuthContext**: User authentication and permissions
- Provides: `user`, `isAuthenticated`, `hasPermission`, `hasRole`

### Local State
- React `useState` for component-level state
- Form state managed locally or with libraries

### Server State
- Fetched via API and cached in component state
- Manual refetch on mutations

## 📝 Naming Conventions

### Files
- **Components**: PascalCase (e.g., `PageHeader.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useApiData.ts`)
- **Utilities**: camelCase (e.g., `auditLogger.ts`)
- **Types**: PascalCase with `.types.ts` suffix

### Code
- **Interfaces**: PascalCase with `I` prefix for models
- **Types**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE

## 🚀 Best Practices

### Component Design
✅ Single Responsibility Principle
✅ Props interface for type safety
✅ Error boundaries for fault tolerance
✅ Loading and error states
✅ Accessibility (ARIA labels, keyboard nav)

### API Design
✅ RESTful endpoints
✅ Consistent response format
✅ Proper HTTP status codes
✅ Validation with Zod schemas
✅ Audit logging for sensitive operations

### Security
✅ Input validation on client and server
✅ SQL injection prevention (Mongoose)
✅ XSS protection (React escaping + httpOnly cookies)
✅ CSRF protection (SameSite cookies)
✅ Rate limiting on sensitive endpoints
✅ Permission checks at multiple layers

### Performance
✅ Database indexes on frequently queried fields
✅ Pagination for large datasets
✅ Lazy loading for routes (Next.js automatic)
✅ Memoization where appropriate
✅ Efficient queries (projections, lean())

## 🧪 Testing Strategy

### Unit Tests
- Services and utilities
- Pure functions and transformations

### Integration Tests
- API routes
- Database operations
- Authentication flows

### E2E Tests
- Critical user journeys
- Permission-based access control
- Form submissions

## 📈 Monitoring & Observability

### Audit Logging
All sensitive operations are logged:
- User actions (CRUD operations)
- Authentication events
- Permission changes
- System configuration changes

### Metrics to Track
- API response times
- Error rates
- Authentication success/failure rates
- User activity patterns
- Permission denial events

---

**Last Updated**: December 2025
**Version**: 1.0.0
