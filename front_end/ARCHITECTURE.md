# Architecture Overview

## State Management with React Context

The app uses React Context API for global state management instead of external libraries like Zustand or Redux. This provides a lightweight, built-in solution perfect for our needs.

### AppContext (`src/contexts/AppContext.tsx`)

Manages all global application state:

```typescript
interface AppState {
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // Flash Cards Progress
  flashcardsProgress: { score: number; answered: number[] };
  updateFlashcardsScore: (score: number) => void;
  addAnsweredCard: (cardId: number) => void;
  resetFlashcards: () => void;
  
  // History Tracking
  podcastHistory: string[];
  addToPodcastHistory: (topic: string) => void;
  comicHistory: string[];
  addToComicHistory: (story: string) => void;
  
  // UI State
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  selectedNode: string | null;
  setSelectedNode: (nodeId: string | null) => void;
}
```

### Usage in Components

```typescript
import { useAppContext } from "@/contexts/AppContext";

function MyComponent() {
  const { flashcardsProgress, updateFlashcardsScore } = useAppContext();
  
  // Use state and actions
  const handleScore = () => {
    updateFlashcardsScore(flashcardsProgress.score + 1);
  };
}
```

## Unified API Layer (`src/lib/api.ts`)

All data fetching, generation, and utilities are centralized in a single file:

### Data Functions

#### Timeline
- `getTimelineData()` - Returns year-by-year study data
- `getTimelineStats()` - Returns aggregated statistics

#### Podcast
- `generatePodcast(input: string)` - Generates dialogue exchanges
- `getPodcastExamples()` - Returns example topics

#### Comic
- `generateComic(storyIdea: string, pages: 1 | 2)` - Generates comic pages
- `getComicExamples()` - Returns example story ideas

#### Knowledge Graph
- `getGraphData()` - Returns nodes and edges
- `getNodeColors()` - Returns color mapping for node types
- `getNodeDescription(type)` - Returns description for node type

#### Flash Cards
- `getFlashCards()` - Returns all flash card data
- `getDifficultyColors()` - Returns difficulty color mapping

#### General
- `getFunFacts()` - Returns rotating facts for marquee

### Benefits of This Approach

1. **Single Source of Truth**: All data logic in one place
2. **Easy to Test**: Pure functions that can be tested independently
3. **Easy to Replace**: When connecting to real APIs, just update this one file
4. **Type Safety**: All functions are fully typed with TypeScript
5. **No External Dependencies**: Uses only built-in JavaScript/TypeScript

## Data Flow

```
Component Request
       ↓
useAppContext() (for state)
       ↓
api.ts function (for data)
       ↓
Component Render
```

### Example: Flash Cards

1. Component calls `useAppContext()` to get progress state
2. Component calls `getFlashCards()` from api.ts to get card data
3. User answers a card
4. Component calls `addAnsweredCard()` and `updateFlashcardsScore()` from context
5. Context updates and re-renders component with new state

## Future: Real API Integration

To connect to real APIs, simply update the functions in `src/lib/api.ts`:

```typescript
// Before (mock data)
export const getTimelineData = (): TimelineDataPoint[] => {
  return [
    { year: 2015, count: 5, highlight: "..." },
    // ...
  ];
};

// After (real API)
export const getTimelineData = async (): Promise<TimelineDataPoint[]> => {
  const response = await fetch('/api/timeline');
  return response.json();
};
```

Components don't need to change - they'll automatically use the new data source!

## Component Structure

### Page Components
Located in `src/app/(main)/[feature]/page.tsx`
- Import hooks and utilities
- Manage local UI state (e.g., current card, flip state)
- Use global state from AppContext
- Fetch data from api.ts
- Render UI components

### Layout Components
- `Sidebar` - Navigation with active state
- `BrandHeader` - Responsive logo header
- `BrandPatternBg` - Decorative pattern overlay

### Reusable Components
- `FactsMarquee` - Rotating facts display
- `AccentBadge` - Themed badge component
- UI components from shadcn/ui

## Performance Considerations

1. **Context Optimization**: Context is divided by feature to avoid unnecessary re-renders
2. **Local State First**: UI-only state (like flip animations) stays local to components
3. **Memo Functions**: Data functions are pure and can be memoized if needed
4. **Lazy Loading**: Each page route is code-split automatically by Next.js

## Type Safety

All data structures are fully typed in `src/types/index.ts`:
- Interfaces for all data models
- Type guards for runtime validation
- Exported types used consistently across app

## Testing Strategy

1. **Unit Tests**: Test individual api.ts functions
2. **Component Tests**: Test components with mock context
3. **Integration Tests**: Test full user flows with real context
4. **E2E Tests**: Test complete features with Playwright/Cypress

## Best Practices

1. **Keep Context Focused**: Only global state that multiple components need
2. **Pure Functions**: All api.ts functions are pure (same input = same output)
3. **Type Everything**: Use TypeScript for all code
4. **Single Responsibility**: Each function does one thing well
5. **Error Handling**: Always handle errors in async operations
