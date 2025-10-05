# NASA Space Biology Knowledge Base

A beautiful, student and public-friendly web application for exploring space biology research. Built for the NASA Space Apps Challenge.

## 🚀 Features

### Interactive Tools
Five main features accessible through a sidebar navigation:

#### 🕐 Timeline
- Interactive bar chart showing research over time
- Click on any year to see highlights
- Visual progress tracking of space biology studies

#### 🎙️ Podcast Creator
- Transform any topic into engaging dialogues
- Natural 2-3 exchange format
- Optional text-to-speech playback
- Perfect for audio learners

#### 📚 Comic Generator
- Turn space biology stories into visual comics
- Choose 1-2 pages (4 panels each)
- Educational storytelling with clear text bubbles
- Download and share your creations

#### 🔗 Knowledge Graph
- Interactive network visualization
- Connect studies, topics, and missions
- Discover hidden relationships
- Click nodes to explore connections

#### 🎴 Flash Cards
- Interactive learning cards
- Self-paced study mode
- Track your progress and score
- Covers key space biology concepts

## 🎨 Design System

### NASA Space Apps Branding
- **Colors**: Electric Blue, Deep Blue, Neon Yellow (accent only), Rocket Red
- **Typography**: 
  - Headings: Fira Sans (Black/Bold)
  - Body: Overpass (Regular/Bold/Italic)
- **Gradient Background**: Electric Blue → Deep Blue (135° angle)
- **Rounded Corners**: 24px (cards), 16px (chips)
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, reduced motion support

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **State Management**: React Context API
- **Data Management**: Unified API utilities file

## 📁 Project Structure

```
front_end/
├── public/
│   └── brand/
│       ├── logos/          # NASA Space Apps logos (default, motif, small)
│       └── patterns/       # Scientific patterns for backgrounds
├── src/
│   ├── app/
│   │   ├── (main)/        # Main app routes with sidebar
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── timeline/      # Timeline feature
│   │   │   ├── podcast/       # Podcast creator
│   │   │   ├── comic/         # Comic generator
│   │   │   ├── graph/         # Knowledge graph
│   │   │   ├── flashcards/    # Flash cards
│   │   │   └── layout.tsx     # Layout with sidebar
│   │   ├── layout.tsx     # Root layout with fonts
│   │   ├── providers.tsx  # React Context provider
│   │   └── globals.css    # Global styles & NASA theme
│   ├── components/
│   │   ├── brand/         # Brand components (Header, Pattern, Badge)
│   │   ├── layout/        # Sidebar navigation
│   │   ├── fun/           # Facts marquee component
│   │   └── ui/            # shadcn/ui components
│   ├── contexts/
│   │   └── AppContext.tsx # Global state management with React Context
│   ├── lib/
│   │   ├── api.ts         # Unified API utilities and data functions
│   │   └── utils.ts       # Utility functions
│   └── types/
│       └── index.ts       # TypeScript types
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd front_end
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm run start
```

## 🎯 Key Pages

### Home (`/`)
- Hero section with inspiring tagline
- Feature cards showcasing all 5 tools
- Rotating "Did you know?" facts
- Clean, focused navigation to each feature

### Timeline (`/timeline`)
- Interactive bar chart visualization
- Year-by-year breakdown of studies
- Progress statistics
- Clickable highlights for each year

### Podcast (`/podcast`)
- Text/topic input area
- AI-generated dialogue (2-3 exchanges)
- Example topics for inspiration
- Play and download controls

### Comic (`/comic`)
- Story idea input
- Page selection (1-2 pages)
- Visual comic panel generation
- Download functionality

### Graph (`/graph`)
- Interactive network visualization
- Node types: Studies, Topics, Missions
- Click to explore connections
- Side panel with node details

### Flash Cards (`/flashcards`)
- Flip card interactions
- Progress tracking
- Score system
- Difficulty levels (Easy, Medium, Hard)

## 🎨 Brand Guidelines

### Logo Usage
- Three variants: `default.svg`, `motif.svg`, `small.svg`
- Responsive: switches based on viewport width
- Never distort or recolor
- Always include alt text: "NASA Space Apps logo"

### Color Palette
```css
--electric-blue: #0066FF    /* Primary, backgrounds, buttons */
--deep-blue: #001E3C        /* Secondary, dark surfaces */
--neon-yellow: #FFFF00      /* Accent ONLY (text, icons, small elements) */
--rocket-red: #FF3B3B       /* Accent (avoid as background) */
```

### Contrast Requirements
- Text contrast ≥ 4.5:1 (WCAG AA)
- Body text only on White, Electric Blue, or Deep Blue backgrounds
- Never use Neon Yellow or Rocket Red as full backgrounds

## 🌟 Future Enhancements

- Real NASA OSDR API integration
- Advanced semantic search with embeddings
- Real TTS generation for podcasts
- AI-powered comic generation with DALL-E/Stable Diffusion
- User accounts and saved favorites
- Social sharing features
- Multilingual support
- AR/VR study visualizations

## 📝 Notes

- All study data is currently mocked for demonstration
- Brand colors are placeholders (final HEX codes TBD)
- TTS and comic generation are simulated with mock responses
- Designed mobile-first with responsive layouts

## 🤝 Contributing

This is a NASA Space Apps Challenge project. For the full implementation:
1. Replace mock data with real API calls
2. Implement actual TTS using services like ElevenLabs or Google TTS
3. Integrate comic generation with DALL-E or similar
4. Add user authentication and personalization
5. Connect to NASA's OSDR (Open Science Data Repository)

## 📄 License

Built for NASA Space Apps Challenge 2025.

---

**Built with ❤️ for space biology education and public engagement**