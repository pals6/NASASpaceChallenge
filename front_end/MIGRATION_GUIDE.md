# Migration Guide: From External State Management to React Context

This guide documents the migration from Zustand/React Query to React Context + Unified API.

## What Changed

### Before
- **Zustand** for client-side state
- **React Query** for server state
- **Multiple API routes** in `/api` directory
- **Scattered mock data** across components

### After
- **React Context** for all state management
- **Unified API file** (`src/lib/api.ts`) for all data
- **No API routes** (fully client-side)
- **Centralized data** in single file

## Migration Steps

### 1. State Management

#### Old Approach (Zustand)
```typescript
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// In component
const { count, increment } = useStore();
```

#### New Approach (React Context)
```typescript
// In AppContext.tsx
interface AppState {
  count: number;
  increment: () => void;
}

// In component
import { useAppContext } from '@/contexts/AppContext';
const { count, increment } = useAppContext();
```

### 2. Data Fetching

#### Old Approach (React Query)
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['timeline'],
  queryFn: async () => {
    const response = await fetch('/api/timeline');
    return response.json();
  },
});
```

#### New Approach (Direct Import)
```typescript
import { getTimelineData } from '@/lib/api';

const timelineData = getTimelineData();
```

### 3. Async Operations

#### Old Approach (API Routes)
```typescript
// src/app/api/podcast/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process and return data
}

// In component
const response = await fetch('/api/podcast', {
  method: 'POST',
  body: JSON.stringify({ input }),
});
```

#### New Approach (Direct Function Call)
```typescript
// src/lib/api.ts
export const generatePodcast = async (input: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return mockDialogue;
};

// In component
import { generatePodcast } from '@/lib/api';
const result = await generatePodcast(input);
```

## Benefits of New Approach

### 1. Simplicity
- No external dependencies to manage
- No need to wrap app in multiple providers
- Easier to understand for newcomers

### 2. Performance
- Smaller bundle size
- No extra React Query cache layer
- Direct function calls are faster

### 3. Maintainability
- All data logic in one file
- Easy to find and update functions
- Clear separation of concerns

### 4. Type Safety
- Better TypeScript inference
- No generic type wrangling
- Simpler interfaces

### 5. Testing
- Pure functions are easy to test
- No need to mock providers
- Can test context separately

## Converting Existing Code

### Step 1: Identify State Usage
Look for:
- `useQuery` hooks
- `useMutation` hooks
- Zustand store usage
- `fetch` calls to `/api/*`

### Step 2: Move to Context
```typescript
// Before
const [value, setValue] = useState();

// After (if global)
const { value, setValue } = useAppContext();

// After (if local)
const [value, setValue] = useState(); // Keep as is
```

### Step 3: Move Data to api.ts
```typescript
// Before (in component)
const data = [
  { id: 1, name: 'Item' },
];

// After (in api.ts)
export const getData = () => [
  { id: 1, name: 'Item' },
];

// In component
import { getData } from '@/lib/api';
const data = getData();
```

## Common Patterns

### Pattern 1: Loading States
```typescript
// Keep loading state local to component
const [isLoading, setIsLoading] = useState(false);

const handleGenerate = async () => {
  setIsLoading(true);
  try {
    const result = await generatePodcast(input);
    // Use result
  } finally {
    setIsLoading(false);
  }
};
```

### Pattern 2: History Tracking
```typescript
// Use context for persistent history
const { podcastHistory, addToPodcastHistory } = useAppContext();

const handleGenerate = async () => {
  const result = await generatePodcast(input);
  addToPodcastHistory(input); // Persist in context
};
```

### Pattern 3: UI State
```typescript
// Use context for shared UI state
const { selectedYear, setSelectedYear } = useAppContext();

// Use local state for component-specific UI
const [isFlipped, setIsFlipped] = useState(false);
```

## Troubleshooting

### Issue: "useAppContext must be used within an AppProvider"
**Solution**: Make sure `<AppProvider>` wraps your app in `providers.tsx`

### Issue: Data doesn't persist between pages
**Solution**: Move the state to AppContext if it needs to be shared

### Issue: Too many re-renders
**Solution**: Split context or use local state for UI-only changes

## Best Practices

1. **Keep Local When Possible**: Only use context for truly global state
2. **Pure Functions**: Keep api.ts functions pure (no side effects)
3. **Type Everything**: Add TypeScript types for all data structures
4. **Error Boundaries**: Wrap context consumers in error boundaries
5. **Split Contexts**: Create separate contexts if they serve different purposes

## Next Steps

When connecting to real APIs:
1. Update functions in `api.ts` to use fetch/axios
2. Add error handling
3. Add loading states to context if needed
4. Keep the same function signatures
5. Components don't need to change!
