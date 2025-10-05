# NASA Space Biology Knowledge Base - Features

## 🎯 Application Structure

### Navigation
- **Sidebar Navigation**: Fixed left sidebar with logo and 6 main sections
- **Responsive Design**: Clean, modern interface with NASA branding
- **Route Groups**: Using Next.js `(main)` route group for consistent layout

### Main Features

#### 1. Home Page (`/`)
**Purpose**: Landing page with feature overview
- Hero section with gradient background and scientific pattern
- Feature cards for all 5 tools with gradient icons
- Rotating "Did you know?" facts
- About section explaining the platform

#### 2. Timeline (`/timeline`)
**Purpose**: Visualize space biology research over time
- Interactive SVG bar chart
- Years 2015-2023 with study counts
- Progress statistics cards
- Clickable year highlights
- Grid view of all years with details

#### 3. Podcast Creator (`/podcast`)
**Purpose**: Generate educational dialogues
- Text/topic input with Textarea
- Example topics for inspiration
- Generates 2-3 back-and-forth exchanges
- Host and Guest speakers with distinct styling
- Play and Download controls (UI only)
- Sidebar with examples and instructions

#### 4. Comic Generator (`/comic`)
**Purpose**: Transform stories into visual comics
- Story idea input
- Page selector (1-2 pages, 4 panels each)
- Visual placeholder for generated comics
- Download functionality (UI ready)
- Example story ideas in sidebar
- Format information card

#### 5. Knowledge Graph (`/graph`)
**Purpose**: Explore connections between research elements
- Interactive SVG network visualization
- Three node types: Studies (blue), Topics (yellow), Missions (red)
- Clickable nodes with details
- Side panel showing connections
- Legend with color coding
- Mock data with 6 nodes and edges

#### 6. Flash Cards (`/flashcards`)
**Purpose**: Interactive learning and self-assessment
- 6 flash cards covering key topics
- Flip animation on click
- Front: Question, Back: Answer
- Progress bar and statistics
- Score tracking system
- "I Knew It" / "Didn't Know" buttons
- Difficulty badges (Easy, Medium, Hard)
- Navigation controls (Previous/Next)
- Reset functionality

## 🎨 Design Elements

### Color System
- **Primary**: Electric Blue (#0066FF) - buttons, highlights
- **Secondary**: Deep Blue (#001E3C) - dark surfaces
- **Accent**: Neon Yellow - small elements only
- **Feature Gradients**: Each feature has unique color gradient
  - Timeline: Blue to Cyan
  - Podcast: Purple to Pink
  - Comic: Amber to Orange
  - Graph: Green to Emerald
  - Flash Cards: Red to Rose

### Components
- **BrandPatternBg**: Scientific pattern overlay at 25% opacity
- **FactsMarquee**: Rotating facts with 6-second intervals
- **Sidebar**: Fixed navigation with active state indicators
- **Cards**: Rounded 2xl corners with smooth transitions
- **Badges**: Category, difficulty, and status indicators

### Typography
- **Headings**: Fira Sans (Black/Bold) - tracking tight
- **Body**: Overpass (Regular/Bold/Italic)
- **Google Fonts**: Loaded via Next.js font system

### Interactions
- **Smooth Transitions**: 120ms ease
- **Tap Scale**: Active state scales to 0.98
- **Hover Effects**: Shadow and color changes
- **Reduced Motion**: Fallback for accessibility

## 📊 Data Structure

### Flash Cards Topics
1. Bone Health - bone density loss in space
2. Plant Biology - growth without gravity
3. Microbiology - microbe behavior in microgravity
4. Sleep Science - circadian rhythms on ISS
5. DNA & Genetics - radiation effects
6. Muscle Health - exercise requirements

### Timeline Data
- 9 years (2015-2023)
- Study counts ranging from 5 to 25
- Notable highlights for each year

### Knowledge Graph
- 3 Study nodes
- 2 Topic nodes
- 1 Mission node
- Multiple connecting edges

## 🚀 Technical Features

### Next.js 15
- App Router with route groups
- Server and Client Components
- TypeScript throughout
- Turbopack for fast dev

### UI Components
- shadcn/ui for base components
- Lucide React for icons
- Custom SVG visualizations
- Responsive grid layouts

### State Management
- React Query for server state (installed but not actively used)
- Local state with useState hooks
- No external API calls (fully self-contained)

### Styling
- Tailwind CSS v4
- Custom CSS variables for theming
- Dark mode support
- Mobile-first responsive design

## 🎓 Educational Value

### Learning Modes
1. **Visual Learning**: Timeline and Graph visualizations
2. **Audio Learning**: Podcast dialogue format
3. **Visual Storytelling**: Comic format
4. **Active Recall**: Flash cards with scoring
5. **Discovery**: Interactive graph exploration

### Accessibility
- WCAG 2.1 AA compliant color contrast
- Keyboard navigation support
- Focus indicators on interactive elements
- Reduced motion support
- Semantic HTML structure

## 🔮 Future Enhancements

### Short Term
- Connect to real NASA OSDR API
- Implement actual TTS for podcasts
- AI image generation for comics
- Add more flash card topics
- User progress persistence

### Long Term
- User accounts and authentication
- Saved favorites and collections
- Social sharing features
- Multilingual support
- Advanced search and filters
- Real-time collaboration
- Mobile app versions

## 📝 Notes

- All features are fully functional in UI
- No backend dependencies (fully frontend)
- Mock data embedded in components
- Ready for API integration
- Production-ready styling and interactions
