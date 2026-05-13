# Frontend Setup & Architecture

Complete guide for setting up and developing the React frontend for Asset Lifecycle Insight.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Development Server](#development-server)
- [Architecture](#architecture)
- [Services Layer](#services-layer)
- [Components](#components)
- [Pages/Routes](#pagesroutes)
- [Building & Deployment](#building--deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Choose one package manager:
- **npm** (Node.js 18+) - Recommended
- **bun** (1.0+) - Faster alternative
- **yarn** (3.0+)

Verify installation:
```bash
node --version  # Should be 18+
npm --version   # Or use: bun --version
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/Veenbreeze/LCCA-CPPM .git
cd LCCA-CPPM /frontend
```

### 2. Install Dependencies

**Using npm:**
```bash
npm install
```

**Using bun:**
```bash
bun install
```

This installs all dependencies listed in `package.json`:
- React 19.2
- TypeScript 5.8
- TanStack Router & React Query
- Vite 7.2
- Tailwind CSS
- Shadcn/ui components
- Axios for HTTP requests
- Recharts for data visualization
- Lucide React for icons
- Sonner for toast notifications

### 3. Environment Configuration

Create `.env.local` in `frontend/` directory:

```env
# API endpoint (adjust if backend runs on different port)
VITE_API_URL=http://localhost:8000/api

# Optional: Debug mode
VITE_DEBUG=false
```

---

## Project Structure

```
frontend/
├── src/
│   ├── routes/                 # Page components (TanStack Router)
│   │   ├── __root.tsx         # Root layout wrapper
│   │   ├── index.tsx          # Home/dashboard page
│   │   ├── assets.tsx         # Asset management page
│   │   ├── condition.tsx      # Condition tracking page
│   │   ├── risk.tsx           # Risk assessment page
│   │   ├── projects.tsx       # Project management page
│   │   ├── scenario.tsx       # Scenario analysis page
│   │   └── reports.tsx        # Reports page
│   │
│   ├── components/            # Reusable components
│   │   ├── ui-kit.tsx         # Exported UI components
│   │   ├── ui/                # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   └── ... (20+ UI components)
│   │   ├── NotificationsBell.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ...
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAssets.ts       # Asset data management
│   │   ├── useConditions.ts   # Condition data management
│   │   ├── useRisk.ts         # Risk data management
│   │   ├── useProjects.ts     # Project data management
│   │   ├── useScenarios.ts    # Scenario data management
│   │   ├── use-theme.tsx      # Theme management
│   │   ├── use-notifications.tsx
│   │   └── use-mobile.tsx
│   │
│   ├── services/              # API communication layer
│   │   ├── api.ts             # Axios configuration
│   │   ├── assetService.ts
│   │   ├── conditionService.ts
│   │   ├── riskService.ts
│   │   ├── projectService.ts
│   │   ├── scenarioService.ts
│   │   ├── reportService.ts
│   │   └── mockData.ts        # Mock data for testing
│   │
│   ├── layouts/               # Layout components
│   │   └── AppLayout.tsx      # Main app layout with navbar
│   │
│   ├── lib/                   # Utility functions
│   │   └── utils.ts           # Common utilities
│   │
│   ├── router.tsx             # TanStack Router configuration
│   ├── routeTree.gen.ts       # Generated route tree (auto)
│   ├── styles.css             # Global styles
│   └── App.tsx                # Root component
│
├── public/                    # Static files
├── dist/                      # Build output (generated)
│
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── eslint.config.js           # ESLint configuration
├── .env.local                 # Environment variables
└── README.md
```

---

## Development Server

### Start Development Server

**Using npm:**
```bash
npm run dev
```

**Using bun:**
```bash
bun run dev
```

**Output:**
```
VITE v7.3.3  ready in 1234 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.x.x:8080/
```

The frontend will:
- Start at `http://localhost:8080` (or next available port)
- Auto-reload on file changes
- Show TypeScript errors in terminal
- Proxy API requests to backend

### Other Available Scripts

```bash
# Build for production
npm run build

# Build in development mode (useful for debugging)
npm run build:dev

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint

# Format code with Prettier
npm run format
```

---

## Architecture

### Core Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 19.2 | Component-based UI |
| **Routing** | TanStack Router | Type-safe client routing |
| **State Management** | React hooks | Component state management |
| **HTTP Client** | Axios | API communication |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Components** | Shadcn/ui | Pre-built UI components |
| **Build Tool** | Vite 7.2 | Fast build and dev server |
| **Language** | TypeScript | Type safety |
| **Icons** | Lucide React | SVG icon library |
| **Notifications** | Sonner | Toast notifications |
| **Charts** | Recharts | Data visualization |

### Application Flow

```
User Browser
    ↓
React App (src/App.tsx)
    ↓
TanStack Router (routes/)
    ↓
Page Components (routes/*.tsx)
    ↓
Custom Hooks (hooks/)
    ↓
Services Layer (services/)
    ↓
Axios HTTP Client
    ↓
Backend API (http://localhost:8000/api)
```

---

## Services Layer

All API communication is handled by service modules in `src/services/`.

### API Service (`services/api.ts`)

Core Axios configuration:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Utility function for handling paginated responses
export function getListData<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : data?.results ?? [];
}

export default api;
```

### Individual Services

#### Asset Service (`services/assetService.ts`)
```typescript
export const AssetService = {
  list: () => api.get("/assets/").then(r => getListData(r.data)),
  get: (id: number) => api.get(`/assets/${id}/`).then(r => r.data),
  create: (asset: Omit<AssetRecord, "id">) => api.post("/assets/", asset).then(r => r.data),
  update: (id: number, asset: Partial<Omit<AssetRecord, "id">>) => api.put(`/assets/${id}/`, asset).then(r => r.data),
  remove: (id: number) => api.delete(`/assets/${id}/`),
};
```

#### Other Services
- **Condition Service** - Track asset conditions
- **Risk Service** - Manage risk assessments
- **Project Service** - Manage capital projects
- **Scenario Service** - Analyze lifecycle cost scenarios
- **Report Service** - Generate and export reports

### Service Usage Pattern

```typescript
import { AssetService, type AssetRecord } from '@/services/assetService';

// In a component:
const assets = await AssetService.list();           // Get all
const asset = await AssetService.get(1);            // Get one
const newAsset = await AssetService.create({...});  // Create
await AssetService.update(1, {...});                // Update
await AssetService.remove(1);                       // Delete
```

---

## Components

### UI Kit Export (`components/ui-kit.tsx`)

Central export point for reusable components:
```typescript
export { Button } from "@/components/ui/button";
export { Card, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
export { Badge, badgeVariants } from "@/components/ui/badge";
export { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
export { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
// ... 20+ more UI components
```

### Shadcn/ui Components Available

- **Input Components:** Button, Input, Checkbox, Radio, Select, Textarea, Toggle
- **Display Components:** Badge, Alert, Separator, Divider
- **Layout Components:** Card, Dialog, Popover, Sheet, Tabs, Accordion
- **Navigation Components:** Breadcrumb, Menubar, Navigation Menu
- **Data Display:** Table, Skeleton
- **Form Components:** Form, Checkbox, Radio, Select inputs
- **Progress:** Progress Bar, Spinner

### Custom Components

- **PageHeader** - Page title with optional action buttons
- **ErrorBoundary** - Error handling wrapper
- **NotificationsBell** - User notifications display
- **StatCard** - Statistics display card
- **ChartCard** - Data visualization card

---

## Pages/Routes

### Route Structure (TanStack Router)

```typescript
// routes/__root.tsx - Root layout
export const Route = createFileRoute('/')({
  component: RootLayout,
});

// routes/index.tsx - Dashboard/Home
export const Route = createFileRoute('/')({
  component: Dashboard,
});

// routes/assets.tsx - Asset Management
export const Route = createFileRoute('/assets')({
  component: AssetsPage,
});
```

### Available Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | `index.tsx` | Dashboard/Home |
| `/assets` | `assets.tsx` | Asset inventory management |
| `/condition` | `condition.tsx` | Asset condition tracking |
| `/risk` | `risk.tsx` | Risk assessment & prioritization |
| `/projects` | `projects.tsx` | Capital project management |
| `/scenario` | `scenario.tsx` | Lifecycle cost scenarios |
| `/reports` | `reports.tsx` | Reports & analytics |

### Page Features

#### Assets Page
- List all assets with search/filter
- Create new assets
- Edit asset details
- Delete assets
- View asset conditions
- Sort by various fields

#### Risk Page
- View risk assessments
- Create new risk assessments
- Risk ranking by score
- Probability × Consequence heatmap
- Risk level badges (Critical, High, Medium, Low)
- Progress bars for risk visualization

#### Scenario Page
- Create lifecycle cost scenarios
- Compare scenarios (repair vs replacement vs maintenance)
- Calculate NPV with discount rates
- Chart visualization of scenario costs
- Best scenario recommendation

#### Projects Page
- List capital projects
- Create/edit projects
- Link projects to assets
- Track budget vs. spent
- Project status tracking

#### Reports Page
- Asset lifecycle report
- CAPEX analysis
- Risk prioritization report
- Export to PDF/CSV

---

## Custom Hooks

### useAssets Hook

```typescript
import { useAssets } from '@/hooks/useAssets';

function MyComponent() {
  const { 
    assets,        // Array of assets
    loading,       // Loading state
    error,         // Error message
    refresh,       // Refresh function
    create,        // Create asset function
    update,        // Update asset function
    remove,        // Delete asset function
  } = useAssets();

  useEffect(() => {
    // Assets loaded automatically on mount
  }, [assets]);
}
```

### Hook Pattern

All data hooks follow the same pattern:
```typescript
export function useResourceName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => { /* ... */ }, []);

  // CRUD operations
  const create = useCallback(async (payload) => { /* ... */ }, []);
  const update = useCallback(async (id, payload) => { /* ... */ }, []);
  const remove = useCallback(async (id) => { /* ... */ }, []);
  const refresh = useCallback(async () => { /* ... */ }, []);

  return { data, loading, error, create, update, remove, refresh };
}
```

Available hooks:
- `useAssets()` - Asset management
- `useConditions()` - Condition tracking
- `useRisk()` - Risk assessments
- `useProjects()` - Project management
- `useScenarios()` - Scenario analysis
- `useTheme()` - Theme management
- `useNotifications()` - Notification system
- `useMobile()` - Mobile detection

---

## Styling

### Tailwind CSS

Global styles configured in `src/styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Configuration in `tailwind.config.js`:
- Custom color scheme
- Dark mode support
- Extended spacing values
- Custom fonts

### Component Styling

All Shadcn/ui components use Tailwind CSS classes:
```typescript
<Button className="bg-primary text-primary-foreground hover:opacity-90">
  Click Me
</Button>
```

### CSS-in-JS Alternative

Use `clsx` or `tailwind-merge` for conditional styling:
```typescript
import { clsx } from 'clsx';

<div className={clsx(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-primary text-white',
  !isActive && 'bg-muted text-muted-foreground'
)}>
  Content
</div>
```

---

## Building & Deployment

### Build for Production

```bash
npm run build
```

**Output:**
```
dist/
├── index.html          # Entry point
├── assets/             # Compiled JS/CSS
│   ├── app-xxxxx.js
│   ├── app-xxxxx.css
│   └── vendor-xxxxx.js
└── ...
```

### Deploy to Production

#### Option 1: Static Hosting (Recommended)
- Netlify, Vercel, GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

**Steps:**
1. Build: `npm run build`
2. Deploy `dist/` folder to host
3. Configure API endpoint environment variable

#### Option 2: Node.js Server
```bash
# Install serve package
npm install -g serve

# Preview build locally
serve -s dist

# Or deploy with your Node server
```

#### Option 3: Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Environment Variables for Production

Create `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_DEBUG=false
```

---

## Performance Optimization

### Code Splitting
Automatically handled by Vite with route-based splitting.

### Image Optimization
Use Next-gen image formats (WebP) and lazy loading.

### Bundle Analysis
```bash
# Install analyzer
npm install -D rollup-plugin-visualizer

# Analyze bundle
npm run build -- --plugin visualizer
```

### Caching Strategy
- Static assets: Long-term cache
- JS/CSS chunks: Version-hashed
- API responses: React Query caching

---

## Troubleshooting

### Port 8080 Already in Use

```bash
# Vite automatically tries next ports (8081, 8082, etc.)
# Or specify port explicitly:
npm run dev -- --port 3000
```

### CORS Errors

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:8000' from 'http://localhost:8080' 
has been blocked by CORS policy
```

**Solution:**
Check backend CORS configuration in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
]
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear TypeScript cache
rm -rf .turbo
npm run dev
```

### Blank Page After Build

Check:
1. `dist/index.html` exists
2. API endpoint is correct in `.env.production`
3. Backend is running
4. CORS is configured

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit

# Fix types
npm run lint -- --fix
```

---

## Development Tips

### Hot Module Replacement (HMR)
Changes to files automatically refresh the page without losing state.

### React DevTools
Install [React DevTools Extension](https://react-devtools-tutorial.vercel.app/) for better debugging.

### Network Tab
Monitor API requests in browser DevTools Network tab.

### Console Debugging
```typescript
console.log('Debug:', variable);
debugger; // Pause execution
```

### Component Profiling
```bash
# In React DevTools: Profiler tab
# Record interactions to analyze performance
```

---

## Testing

### Unit Tests (Jest)
```bash
npm test
```

### Component Tests
Use React Testing Library (can be configured).

### E2E Tests (Playwright)
Can be configured for end-to-end testing.

---

**Last Updated:** May 2026
