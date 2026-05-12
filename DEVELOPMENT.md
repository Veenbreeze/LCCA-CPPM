# Development Guide

Complete guide for developing, testing, and contributing to Asset Lifecycle Insight.

## 📋 Table of Contents
- [Development Environment](#development-environment)
- [Workflow](#workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)
- [Performance Tips](#performance-tips)

---

## Development Environment

### Complete Setup

#### 1. Clone and Setup Backend

```bash
git clone https://github.com/Veenbreeze/asset-lifecycle-insight.git
cd asset-lifecycle-insight/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

#### 2. Setup Frontend (in new terminal)

```bash
cd asset-lifecycle-insight/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:8080** (or next available port)

### Verify Setup

- Backend: Visit `http://localhost:8000/api/assets/` - should show empty list or assets
- Frontend: Visit `http://localhost:8080` - should show dashboard
- Admin: Visit `http://localhost:8000/admin/` - should show login

---

## Workflow

### Daily Development Cycle

```
1. Create feature branch
   ↓
2. Make changes (backend/frontend/docs)
   ↓
3. Test locally
   ↓
4. Commit changes
   ↓
5. Push to GitHub
   ↓
6. Create Pull Request
   ↓
7. Code review
   ↓
8. Merge to main
```

### Starting a New Feature

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/feature-name

# 3. Make changes and test
# ... edit files ...
npm run dev      # Frontend
python manage.py runserver  # Backend

# 4. Commit changes
git add .
git commit -m "Add feature description"

# 5. Push to GitHub
git push origin feature/feature-name

# 6. Create Pull Request on GitHub
```

---

## Code Standards

### Backend (Django/Python)

#### File Structure

```
app_name/
├── __init__.py
├── admin.py           # Admin interface registration
├── apps.py            # App configuration
├── models.py          # Database models
├── serializers.py     # DRF serializers
├── views.py           # API viewsets
├── urls.py            # URL routing
├── tests.py           # Unit tests
└── migrations/        # Database migrations
```

#### Model Best Practices

```python
from django.db import models

class Asset(models.Model):
    """Asset model for portfolio tracking."""
    
    # Use descriptive names
    name = models.CharField(max_length=255, unique=True)
    asset_type = models.CharField(max_length=50, choices=ASSET_TYPES)
    
    # Add help text
    condition_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        help_text="Rating from 1 (worst) to 5 (best)"
    )
    
    # Use sensible defaults
    status = models.CharField(
        max_length=20,
        default="Operational",
        choices=STATUS_CHOICES
    )
    
    # Timestamps are helpful
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name_plural = "Assets"
    
    def __str__(self):
        return self.name
```

#### View Best Practices

```python
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

class AssetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for asset management.
    
    - Supports full CRUD operations
    - Filterable by asset_type and status
    - Searchable by name and location
    """
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [AllowAny]
    
    # Enable filtering and search
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ['asset_type', 'status']
    search_fields = ['name', 'location']
    ordering_fields = ['name', 'condition_rating', 'created_at']
```

#### Serializer Best Practices

```python
from rest_framework import serializers

class AssetSerializer(serializers.ModelSerializer):
    """Serializer for Asset model."""
    
    class Meta:
        model = Asset
        fields = [
            'id',
            'name',
            'asset_type',
            'location',
            'installation_date',
            'condition_rating',
            'remaining_useful_life',
            'status',
        ]
    
    # Add validation
    def validate_condition_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError(
                "Rating must be between 1 and 5"
            )
        return value
```

### Frontend (React/TypeScript)

#### File Structure

```
src/
├── components/
│   ├── PageHeader.tsx     # Component file
│   ├── index.ts           # Export file (optional)
│   └── PageHeader.test.tsx # Test file
├── hooks/
│   └── useAssets.ts       # Custom hook
├── services/
│   └── assetService.ts    # API service
└── routes/
    └── assets.tsx         # Page component
```

#### Component Best Practices

```typescript
import { FC, useState, useCallback } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * PageHeader component displays page title and optional actions.
 */
export const PageHeader: FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  actions 
}) => {
  return (
    <div className="mb-6 space-y-2">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
};
```

#### Hook Best Practices

```typescript
import { useState, useCallback, useEffect } from 'react';
import { AssetService, type AssetRecord } from '@/services/assetService';

export function useAssets() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadAssets();
  }, []);

  // Separate logic into functions
  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AssetService.list();
      setAssets(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD operations
  const create = useCallback(async (payload: Omit<AssetRecord, 'id'>) => {
    try {
      const created = await AssetService.create(payload);
      setAssets(prev => [created, ...prev]);
      return created;
    } catch (err) {
      throw new Error(`Failed to create: ${(err as Error).message}`);
    }
  }, []);

  return { assets, loading, error, create, loadAssets };
}
```

#### Service Best Practices

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Utility for pagination handling
export function getListData<T>(
  data: T[] | { results: T[] }
): T[] {
  return Array.isArray(data) ? data : data?.results ?? [];
}

export const AssetService = {
  list: () => 
    api.get<AssetRecord[] | { results: AssetRecord[] }>('/assets/')
       .then(r => getListData(r.data)),
  
  get: (id: number) => 
    api.get<AssetRecord>(`/assets/${id}/`)
       .then(r => r.data),
  
  create: (payload: Omit<AssetRecord, 'id'>) => 
    api.post<AssetRecord>('/assets/', payload)
        .then(r => r.data),
  
  update: (id: number, payload: Partial<Omit<AssetRecord, 'id'>>) => 
    api.put<AssetRecord>(`/assets/${id}/`, payload)
       .then(r => r.data),
  
  remove: (id: number) => 
    api.delete(`/assets/${id}}/`),
};
```

---

## Testing

### Backend Tests (Django)

#### Run Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test assets

# Run specific test class
python manage.py test assets.tests.AssetTestCase

# Run with verbosity
python manage.py test -v 2

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

#### Write Tests

```python
# assets/tests.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import Asset

class AssetAPITestCase(TestCase):
    """Test Asset API endpoints."""
    
    def setUp(self):
        """Setup test data."""
        self.client = APIClient()
        self.asset = Asset.objects.create(
            name="Test Boiler",
            asset_type="Mechanical",
            location="Building A",
            condition_rating=3.5,
            remaining_useful_life=5,
        )
    
    def test_list_assets(self):
        """Test listing assets."""
        response = self.client.get('/api/assets/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_asset(self):
        """Test creating asset."""
        data = {
            'name': 'New Asset',
            'asset_type': 'Electrical',
            'location': 'Building B',
            'condition_rating': 4.0,
            'remaining_useful_life': 8,
        }
        response = self.client.post('/api/assets/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['name'], 'New Asset')
```

### Frontend Tests (Jest/React Testing Library)

#### Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

#### Write Tests

```typescript
// components/__tests__/PageHeader.test.tsx
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <PageHeader title="Title" subtitle="Subtitle" />
    );
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders action button', () => {
    render(
      <PageHeader 
        title="Title" 
        actions={<button>Action</button>} 
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

---

## Git Workflow

### Commit Message Standards

**Format:**
```
<type>: <short description>

<optional detailed explanation>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation change
- `style:` - Code style (formatting, semicolons, etc.)
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Adding or updating tests
- `chore:` - Maintenance, dependencies, etc.

**Examples:**
```bash
git commit -m "feat: add risk prioritization dashboard"
git commit -m "fix: correct NPV calculation for scenarios"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify asset service layer"
```

### Branch Naming

```
feature/feature-name
bugfix/issue-description
docs/documentation-update
refactor/what-is-being-refactored
```

### Pull Request Process

1. Create feature branch from main
2. Make commits with clear messages
3. Push to GitHub
4. Create PR with description
5. Address review comments
6. Merge when approved
7. Delete feature branch

---

## Debugging

### Backend Debugging

#### Using Django Shell

```bash
python manage.py shell

# In shell:
from assets.models import Asset
assets = Asset.objects.all()
for asset in assets:
    print(f"{asset.name}: {asset.condition_rating}")
```

#### Using print() and logging

```python
import logging
logger = logging.getLogger(__name__)

# In view:
logger.debug(f"Processing asset: {asset.id}")
logger.warning(f"Low condition rating: {asset.condition_rating}")
```

#### Using pdb

```python
# Add breakpoint in code:
import pdb; pdb.set_trace()

# Or use built-in breakpoint() (Python 3.7+):
breakpoint()

# In pdb:
(Pdb) n          # Next line
(Pdb) s          # Step into
(Pdb) c          # Continue
(Pdb) p variable # Print variable
(Pdb) l          # List code
```

### Frontend Debugging

#### Browser DevTools

1. Press `F12` or right-click → Inspect
2. **Console** - Check for errors and use `console.log()`
3. **Sources** - Set breakpoints and debug
4. **Network** - Monitor API calls
5. **React DevTools** - Inspect component tree

#### React DevTools Extension

- [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Usage:**
- Inspect components
- View props and state
- Profile performance
- Jump to source code

#### TypeScript Debugging

```typescript
// Use satisfies operator to catch type errors
const config = {
  timeout: 5000,
  retries: 3,
} satisfies APIConfig;

// Use type assertion in debugger
const value: unknown = someData;
const typed = value as AssetRecord;
```

---

## Common Tasks

### Adding a New API Endpoint

#### Backend

1. **Create model** in `app/models.py`:
```python
class MyModel(models.Model):
    name = models.CharField(max_length=255)
    # ... other fields
```

2. **Create serializer** in `app/serializers.py`:
```python
class MySerializer(serializers.ModelSerializer):
    class Meta:
        model = MyModel
        fields = ['id', 'name', ...]
```

3. **Create viewset** in `app/views.py`:
```python
class MyViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MySerializer
    permission_classes = [AllowAny]
```

4. **Register route** in `api.py`:
```python
router.register(r'mymodels', MyViewSet)
```

5. **Run migrations**:
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Frontend

1. **Create service** in `src/services/myService.ts`:
```typescript
export const MyService = {
  list: () => api.get("/mymodels/").then(r => getListData(r.data)),
  // ... CRUD operations
};
```

2. **Create hook** in `src/hooks/useMyData.ts`:
```typescript
export function useMyData() {
  // ... hook logic
}
```

3. **Create page** in `src/routes/mypage.tsx`:
```typescript
export const Route = createFileRoute('/mypage')({
  component: MyPage,
});

function MyPage() {
  const { data, loading, error } = useMyData();
  // ... component logic
}
```

### Adding Documentation

1. **Update README.md** - For overview changes
2. **Update BACKEND_SETUP.md** - For backend changes
3. **Update FRONTEND_SETUP.md** - For frontend changes
4. **Update API_DOCUMENTATION.md** - For API changes
5. **Add code comments** - For complex logic
6. **Add JSDoc/docstrings** - For functions and classes

---

## Performance Tips

### Backend

```python
# Use select_related for foreign keys
queryset = Asset.objects.select_related('project')

# Use prefetch_related for reverse relations
queryset = Project.objects.prefetch_related('assets')

# Use only() to limit fields
queryset = Asset.objects.only('id', 'name')

# Use values() for aggregation
Asset.objects.values('asset_type').count()

# Add database indexes
class Meta:
    indexes = [
        models.Index(fields=['status', '-created_at']),
    ]
```

### Frontend

```typescript
// Use useMemo for expensive calculations
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.value, 0),
  [items]
);

// Use useCallback to prevent re-renders
const handleClick = useCallback(() => {
  // ...
}, [dependency]);

// Use React.memo for pure components
export const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// Lazy load routes
const AssetPage = lazy(() => import('./routes/assets'));
```

---

## Useful Tools

### Backend
- **Django Debug Toolbar** - Debug queries and requests
- **Black** - Code formatter
- **Flake8** - Linter
- **isort** - Import sorter

### Frontend
- **Prettier** - Code formatter
- **ESLint** - Linter
- **Vitest** - Fast unit testing
- **Playwright** - E2E testing

---

**Last Updated:** May 2026
