# RBAC Web Application - Setup & Usage Guide

## 🎯 Overview

This is a production-ready Role-Based Access Control (RBAC) system built with:
- **Next.js 16** (App Router)
- **TypeScript** (strict mode)
- **MongoDB** with Mongoose
- **JWT** authentication (httpOnly cookies)
- **Tailwind CSS 4**
- **Multi-level permissions** (page, component, data, action)

## 📋 Features

### Authentication
- ✅ JWT-based authentication with refresh tokens
- ✅ Secure httpOnly cookies
- ✅ Automatic token refresh
- ✅ Session management
- ✅ Rate limiting (login, register, API)
- ✅ Password strength validation

### Authorization
- ✅ Hierarchical roles (Admin > Manager > User)
- ✅ Fine-grained permissions
- ✅ Page-level route protection
- ✅ Component-level guards
- ✅ Data-level filtering
- ✅ Action-level checks

### Security
- ✅ Bcrypt password hashing (12 salt rounds)
- ✅ JWT signature verification
- ✅ CSRF protection (SameSite cookies)
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Mongoose)

### Admin Features
- ✅ User management UI (create, read, update, delete)
- ✅ Role management and assignment interface
- ✅ Audit logging and activity tracking
- ✅ Activity dashboard with statistics
- ✅ Search and filter capabilities

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB and start the service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update `.env.local` with your connection string

### 3. Configure Environment Variables

The `.env.local` file is already created with default values:

```env
MONGODB_URI=mongodb://localhost:27017/rbac_web_app
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-please-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-minimum-32-characters-long-change-this-too
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**⚠️ IMPORTANT:** Change the JWT secrets in production!

### 4. Seed the Database

```bash
npm run seed
```

This creates:
- **18 Permissions** across 5 categories
- **3 Roles** (Admin, Manager, User)
- **3 Test Users**

### 5. Start the Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@example.com | Admin@123 |
| **Manager** | manager@example.com | Manager@123 |
| **User** | user@example.com | User@123 |

## 📊 Default Permissions

### Admin (All Permissions)
- All user management (create, read, update, delete)
- All role management
- All project management
- Analytics access
- Settings management

### Manager (Limited)
- Read/update users
- Create/read/update projects
- View analytics
- View settings

### User (Basic)
- Read projects
- View settings

## 🏗️ Architecture

### Directory Structure
```
app/
├── (auth)/                 # Auth pages (login, register)
├── api/                    # Backend API routes
│   ├── auth/              # Authentication endpoints
│   ├── users/             # User management
│   ├── roles/             # Role management
│   └── permissions/       # Permission listing
├── components/
│   ├── auth/              # Login/Register forms
│   ├── guards/            # ProtectedRoute, PermissionGate
│   └── layouts/           # Header, Sidenav, Footer
└── dashboard/             # Protected dashboard pages

lib/
├── contexts/              # AuthContext
├── db/                    # MongoDB models
├── hooks/                 # useAuth, usePermission, useRole
├── middleware/            # Auth, permission, rate limiting
├── repositories/          # Data access layer
├── services/              # Business logic
└── utils/                 # JWT, cookies, validation

config/
├── permissions.ts         # Permission definitions
├── roles.ts              # Default roles
└── routes.ts             # Route permissions

types/                     # TypeScript definitions
```

### Authentication Flow

1. **Login**: POST /api/auth/login
   - Validates credentials
   - Generates JWT tokens
   - Sets httpOnly cookies
   - Returns user + permissions

2. **Automatic Refresh**:
   - Access token expires after 15 minutes
   - Axios interceptor catches 401
   - Calls /api/auth/refresh
   - Updates access token
   - Retries original request

3. **Logout**: POST /api/auth/logout
   - Invalidates session
   - Clears cookies
   - Redirects to login

### Permission Checking

**1. Middleware (Route Level)**
```typescript
// proxy.ts protects entire routes
if (pathname.startsWith('/dashboard')) {
  // Check auth token
}
```

**2. Component Level**
```tsx
<PermissionGate permission="users.delete">
  <DeleteButton />
</PermissionGate>
```

**3. Hook Level**
```tsx
const canDelete = usePermission('users.delete');
if (canDelete) {
  // Show delete button
}
```

**4. API Level**
```typescript
await requirePermission(request, 'users.delete');
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users` - List users (pagination, filters)
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Roles & Permissions
- `GET /api/roles` - List all roles
- `GET /api/permissions` - List all permissions

### Audit Logs
- `GET /api/audit-logs` - List audit logs (with filters)
- `GET /api/audit-logs/statistics` - Get audit statistics

## 👨‍💼 Admin Features

### User Management
Access the user management interface at `/dashboard/users`:
- **View all users** with pagination, search, and role filtering
- **Create new users** with email, password, and role assignment
- **Edit existing users** - update details, change roles, toggle active status
- **Delete users** with confirmation prompt
- **Search users** by name or email
- **Filter by role** (Admin, Manager, User)

### Role Management
View and understand roles at `/dashboard/roles`:
- **View all roles** with hierarchy levels
- **See permissions** grouped by category for each role
- **Understand access levels** - which permissions each role has

### Activity Dashboard
Monitor system activity at `/dashboard/activity`:
- **Statistics cards** showing total events, success rate, and failure rate
- **Recent activity feed** with action types, timestamps, and user info
- **Filter by resource** (auth, users, roles, projects, settings)
- **Filter by status** (success, failure)
- **IP address tracking** for security monitoring
- **Error messages** for failed actions

### Audit Logging
All user actions are automatically logged:
- **Authentication events**: login, logout, registration (both success and failure)
- **User management**: create, update, delete users
- **Role changes**: role assignments and modifications
- **Resource tracking**: which resources were affected
- **Details captured**: IP address, user agent, timestamp, user info
- **Error tracking**: failed actions with error messages

## 🛡️ Security Features

### Token Security
- Access Token: 15 minutes (short-lived)
- Refresh Token: 7 days (30 days with "Remember Me")
- httpOnly cookies (not accessible via JavaScript)
- Secure flag in production
- SameSite=Lax (CSRF protection)

### Password Security
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special char
- Bcrypt hashing with 12 salt rounds
- Never returned in API responses

### Rate Limiting
- Login: 5 requests/minute
- Register: 3 requests/hour
- API: 100 requests/15 minutes

## 🧪 Testing the System

### 1. Test Different Roles

Login as each user and observe:
- **Admin**: Can see all navigation items (Users, Roles, Activity, Analytics, Projects, Settings)
- **Manager**: Can see Users, Analytics, Projects, Settings (no Roles or Activity)
- **User**: Very limited access (Projects, Settings only)

### 2. Test Permission Gates

Try accessing:
- `/dashboard/users` - Only visible to Admin & Manager
- `/dashboard/roles` - Only visible to Admin & Manager
- `/dashboard/activity` - Only visible to Admin & Manager
- `/dashboard/analytics` - Only visible to Admin & Manager
- `/dashboard/projects` - Visible to all
- `/dashboard/settings` - Visible to all

### 3. Test User Management

Login as Admin and try:
1. **Create a user**: Navigate to `/dashboard/users` and click "Add User"
2. **Edit a user**: Click "Edit" on any user, modify details, change roles
3. **Delete a user**: Click "Delete" and confirm
4. **Search users**: Use the search box to find users by name or email
5. **Filter by role**: Use the role dropdown to filter users

### 4. Test Audit Logging

Login as Admin and:
1. Navigate to `/dashboard/activity`
2. Perform some actions (create/edit/delete users, login/logout)
3. Return to `/dashboard/activity` and verify the actions are logged
4. Check that IP addresses and timestamps are recorded
5. Filter by resource or status to see specific logs

### 5. Test API Protection

```bash
# Without auth - should fail
curl http://localhost:3000/api/users

# With auth - use browser with logged-in session
# Or use Postman with cookies
```

## 🚢 Production Deployment

### 1. Update Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=generate-strong-random-32-char-secret
JWT_REFRESH_SECRET=generate-another-strong-secret
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### 2. Build the Application
```bash
npm run build
npm start
```

### 3. Security Checklist
- [ ] Change JWT secrets
- [ ] Use production MongoDB
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure CORS if needed
- [ ] Set up monitoring
- [ ] Configure backup strategy

## 📖 Usage Examples

### Protect a Page
```tsx
// app/dashboard/admin/page.tsx
import ProtectedRoute from '@/app/components/guards/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin Only Content</div>
    </ProtectedRoute>
  );
}
```

### Conditional Rendering
```tsx
import PermissionGate from '@/app/components/guards/PermissionGate';
import { PERMISSIONS } from '@/config/permissions';

function UserList() {
  return (
    <div>
      <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
        <button>Add User</button>
      </PermissionGate>
    </div>
  );
}
```

### Check Permission in Code
```tsx
import { usePermission } from '@/lib/hooks/usePermission';

function MyComponent() {
  const canDelete = usePermission('users.delete');

  const handleDelete = () => {
    if (!canDelete) {
      alert('No permission');
      return;
    }
    // Delete user
  };
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED
```
**Solution**: Ensure MongoDB is running: `mongod`

### JWT Errors
```
Error: JWT secrets are not defined
```
**Solution**: Check `.env.local` exists and contains JWT secrets

### Permission Denied
```
403 Forbidden: Missing required permission
```
**Solution**: Login with correct user role or check permission configuration

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [JWT Best Practices](https://jwt.io/introduction)
- [OWASP Security](https://owasp.org/www-project-top-ten/)

## 🤝 Support

For issues or questions:
1. Check this README
2. Review the implementation plan in `.claude/plans/`
3. Check the code comments
4. Test with different user roles

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
