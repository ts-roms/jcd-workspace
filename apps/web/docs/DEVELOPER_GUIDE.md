# Developer Quick Reference Guide

## 🚀 Getting Started

### Project Structure
```
/admin      → Admin features (requires permissions)
/dashboard  → User features (authenticated)
/api        → Backend API routes
/components → Reusable UI components
/lib        → Business logic, hooks, utilities
/types      → TypeScript type definitions
```

## 📦 Importing Components

### UI Components
```typescript
// Single import
import { Button, Card, PageHeader } from '@/app/components/ui';

// Usage
<PageHeader
  title="Page Title"
  description="Optional description"
  action={<Button variant="primary">Action</Button>}
/>
```

### Hooks
```typescript
import { useAuth } from '@/lib/contexts/AuthContext';
import { usePermission } from '@/lib/hooks/usePermission';
import { useApiData } from '@/lib/hooks/useApiData';

// In component
const { user, isAuthenticated, hasPermission } = useAuth();
const canEdit = usePermission('users.update');
const { data, loading, error, refetch } = useApiData<User[]>('/api/users');
```

## 🎨 UI Component Patterns

### Page Structure
```typescript
export default function MyPage() {
  const { data, loading, error, refetch } = useApiData('/api/resource');

  if (loading) return <LoadingSkeleton count={5} />;
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Page Title"
        description="Description"
        action={<Button>Action</Button>}
      />

      <Card>
        {data.length === 0 ? (
          <EmptyState title="No data" />
        ) : (
          // Render data
        )}
      </Card>
    </>
  );
}
```

### Button Variants
```typescript
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>

// With loading
<Button isLoading={loading}>Save</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Cards
```typescript
<Card>Content with padding</Card>
<Card padding={false}>Content without padding</Card>
<Card className="custom-class">With custom styles</Card>
```

## 🔐 Permission Checking

### Component Level
```typescript
import PermissionGate from '@/app/components/guards/PermissionGate';

<PermissionGate permission={PERMISSIONS.USERS_DELETE}>
  <Button variant="danger">Delete</Button>
</PermissionGate>
```

### Hook Level
```typescript
const canDelete = usePermission('users.delete');

{canDelete && <Button variant="danger">Delete</Button>}
```

### API Level
```typescript
import { requirePermission } from '@/lib/middleware/permission.middleware';

export async function DELETE(request: NextRequest) {
  const authRequest = await authenticateRequest(request);
  await requirePermission(authRequest, PERMISSIONS.USERS_DELETE);
  // Proceed with deletion
}
```

## 📡 API Patterns

### Fetching Data
```typescript
// Option 1: Using hook
const { data, loading, error } = useApiData<User[]>('/api/users');

// Option 2: Manual
import axios from '@/lib/api/axios';

const fetchUsers = async () => {
  const response = await axios.get('/api/users');
  return response.data;
};
```

### Creating Data
```typescript
const handleCreate = async (userData: CreateUserData) => {
  try {
    await axios.post('/api/users', userData);
    // Handle success
  } catch (error: any) {
    // Handle error
    const message = error.response?.data?.error?.message || 'Failed';
  }
};
```

### Updating Data
```typescript
const handleUpdate = async (id: string, data: UpdateData) => {
  await axios.patch(`/api/users/${id}`, data);
};
```

### Deleting Data
```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return;
  await axios.delete(`/api/users/${id}`);
};
```

## 🎯 Common Patterns

### Loading States
```typescript
{loading && <LoadingSkeleton count={3} />}
{loading && <TableSkeleton rows={5} />}
```

### Error States
```typescript
{error && <ErrorDisplay message={error} onRetry={refetch} />}
```

### Empty States
```typescript
{items.length === 0 && (
  <EmptyState
    title="No items found"
    description="Get started by creating your first item"
    action={<Button onClick={handleCreate}>Create Item</Button>}
  />
)}
```

### Pagination
```typescript
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

<div className="flex justify-between items-center">
  <Button
    disabled={page === 1}
    onClick={() => onPageChange(page - 1)}
  >
    Previous
  </Button>
  <span>Page {page} of {totalPages}</span>
  <Button
    disabled={page === totalPages}
    onClick={() => onPageChange(page + 1)}
  >
    Next
  </Button>
</div>
```

## 🛠️ Creating New Features

### 1. Create Types
```typescript
// types/feature.types.ts
export interface Feature {
  id: string;
  name: string;
  description: string;
}
```

### 2. Create Database Model
```typescript
// lib/db/models/Feature.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFeature extends Document {
  name: string;
  description: string;
}

const FeatureSchema = new Schema<IFeature>({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

export default mongoose.models.Feature || mongoose.model<IFeature>('Feature', FeatureSchema);
```

### 3. Create Repository
```typescript
// lib/repositories/feature.repository.ts
import Feature, { IFeature } from '../db/models/Feature';

class FeatureRepository {
  async findAll(): Promise<IFeature[]> {
    return Feature.find().lean().exec();
  }

  async findById(id: string): Promise<IFeature | null> {
    return Feature.findById(id).lean().exec();
  }

  async create(data: Partial<IFeature>): Promise<IFeature> {
    return Feature.create(data);
  }

  async update(id: string, data: Partial<IFeature>): Promise<IFeature | null> {
    return Feature.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  async delete(id: string): Promise<void> {
    await Feature.findByIdAndDelete(id);
  }
}

export default new FeatureRepository();
```

### 4. Create Service
```typescript
// lib/services/feature.service.ts
import FeatureRepository from '../repositories/feature.repository';

class FeatureService {
  async getAllFeatures() {
    return FeatureRepository.findAll();
  }

  async createFeature(data: any) {
    // Add business logic
    return FeatureRepository.create(data);
  }
}

export default new FeatureService();
```

### 5. Create API Route
```typescript
// app/api/features/route.ts
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth.middleware';
import FeatureService from '@/lib/services/feature.service';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request);
    const features = await FeatureService.getAllFeatures();
    return successResponse({ features });
  } catch (error) {
    return errorResponse(error);
  }
}
```

### 6. Create Page
```typescript
// app/dashboard/features/page.tsx
'use client';

import { useApiData } from '@/lib/hooks/useApiData';
import { PageHeader, Card, EmptyState } from '@/app/components/ui';

export default function FeaturesPage() {
  const { data, loading, error } = useApiData('/api/features');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <PageHeader title="Features" />
      <Card>
        {data.features.length === 0 ? (
          <EmptyState title="No features" />
        ) : (
          // Render features
        )}
      </Card>
    </>
  );
}
```

## 🐛 Debugging Tips

### Check Authentication
```typescript
const { user, isAuthenticated } = useAuth();
console.log('User:', user);
console.log('Authenticated:', isAuthenticated);
```

### Check Permissions
```typescript
const { user } = useAuth();
console.log('Permissions:', user?.permissions.map(p => p.name));
```

### API Errors
```typescript
try {
  await axios.get('/api/endpoint');
} catch (error: any) {
  console.error('Status:', error.response?.status);
  console.error('Message:', error.response?.data?.error?.message);
  console.error('Details:', error.response?.data?.error?.details);
}
```

## 📚 Additional Resources

- **Architecture**: See `ARCHITECTURE.md`
- **Cleanup Summary**: See `CLEANUP_SUMMARY.md`
- **README**: See `README_RBAC.md`
- **Types**: Check `types/` directory
- **Examples**: Look at existing pages in `/admin` and `/dashboard`

## 🎯 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Seed database
npm run seed

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## ⚠️ Common Gotchas

1. **Always authenticate API routes**
   ```typescript
   const authRequest = await authenticateRequest(request);
   ```

2. **Check permissions before sensitive operations**
   ```typescript
   await requirePermission(authRequest, PERMISSIONS.RESOURCE_ACTION);
   ```

3. **Use TypeScript generics with hooks**
   ```typescript
   const { data } = useApiData<User[]>('/api/users');
   ```

4. **Always handle loading and error states**
   ```typescript
   if (loading) return <LoadingSkeleton />;
   if (error) return <ErrorDisplay message={error} />;
   ```

5. **Next.js 15 dynamic params are async**
   ```typescript
   export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
   }
   ```

---

**Happy Coding!** 🚀
