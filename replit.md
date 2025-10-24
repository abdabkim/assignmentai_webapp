# AssignmentPlanner AI

## Overview

AssignmentPlanner AI is an intelligent academic planning application designed to help students break down assignments into manageable tasks with AI-powered scheduling. The application features a vibrant, modern UI with purple gradients and colorful design elements, making it both visually engaging and productivity-inspiring.

The system includes 5 free productivity tools and 5 premium AI-powered features, all wrapped in a university-presentable interface. Built as a progressive web application (PWA) with offline capabilities, it combines AI-generated task breakdowns with comprehensive planning, tracking, and collaboration tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (October 2025)

### UI/UX Enhancements
- **Vibrant Dashboard Design**: Redesigned with colorful gradient stat cards (yellow/orange for Assignments, green/emerald for Progress, pink/purple for Deadlines)
- **Purple Gradient Sidebar**: Modern purple-to-indigo gradient (purple-600 via purple-700 to indigo-800) with white text, decorative background elements, and improved visual hierarchy
- **Enhanced Interactions**: Added smooth hover effects, shadows, and scale transforms throughout the interface
- **Username Validation**: Enforced 3-20 character limit with real-time validation, character counter, and display truncation to prevent overflow

### Premium Features (New)
Five AI-powered premium-only features added:
1. **Procrastination Pattern Analyzer**: AI analyzes user patterns and provides personalized anti-procrastination strategies with productivity window recommendations
2. **Research Connection Mapper**: Discovers hidden connections between research topics, shows cross-disciplinary insights with relevance scoring
3. **Screenshot → Searchable Notes**: OCR-powered conversion of lecture slide screenshots into searchable, organized notes with keyword extraction
4. **Assignment Complexity Predictor**: AI-powered time estimation with breakdown by phase (research, writing, revision), risk assessment, and recommendations
5. **Study Buddy Matcher**: Matches students by course, schedule, study vibe, and compatibility score for effective collaboration

### Free Tools (Verified Working)
All five free productivity tools confirmed functional:
1. **Pomodoro Timer**: Configurable work/break intervals with session tracking
2. **Smart Citation Builder**: Generates APA, MLA, and Chicago citations for books, journals, websites
3. **Burnout Detector**: Wellness tracking with personalized recommendations
4. **Voice Memo Research Notes**: Audio recording with playback and organization
5. **Study Group Sharing**: Peer review and collaboration features

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15 with React Server Components (RSC)
- **Rationale**: Next.js provides excellent developer experience, built-in routing, and SSR/SSG capabilities. The App Router with RSC enables better performance and SEO.
- **TypeScript**: Full type safety across the application
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components

**State Management**:
- React Context API for global state (Auth, User Preferences)
- Local component state with React hooks
- **Rationale**: Lightweight state management suitable for the application's complexity. Context providers handle cross-cutting concerns (authentication, theme, preferences) while avoiding over-engineering.

**UI Component System**:
- shadcn/ui - A collection of re-usable components built with Radix UI primitives
- Lucide React for icons
- **Rationale**: shadcn provides accessible, customizable components without the overhead of a full component library. Components are copied into the project for full control.

**Routing Structure**:
- `/` - Home/redirect page
- `/landing` - Public landing page
- `/login` - Authentication
- `/signup` - User registration
- `/dashboard` - Main application interface (protected)
- `/premium` - Premium subscription features
- `/profile` - User profile management

**Key Design Patterns**:
- **View-based architecture**: Dashboard uses a single-page approach with view switching (Dashboard, Tools, Productivity, Insights, Schedule, Report, Profile, Settings)
- **Component composition**: Reusable UI components with clear separation of concerns
- **Responsive design**: Mobile-first approach with sidebar toggles and adaptive layouts

### Backend Architecture

**Authentication & User Management**:
- Firebase Authentication with email/password and Google OAuth
- User data stored in Firestore with profile information
- **Rationale**: Firebase provides production-ready auth with minimal setup, OAuth integrations, and security rules out of the box.

**Data Layer**:
- Dual storage strategy:
  - **Primary**: Firestore for authenticated users (cloud sync)
  - **Fallback**: LocalStorage for offline/anonymous usage
- **Rationale**: Provides seamless offline functionality while enabling cloud sync for authenticated users. Graceful degradation when Firestore is unavailable.

**AI Integration**:
- Google Gemini AI for assignment plan generation
- Generates structured task breakdowns based on assignment type, requirements, and due dates
- **Rationale**: Gemini provides powerful natural language understanding for creating contextual, intelligent task breakdowns tailored to different academic assignment types.

**Data Models**:

```typescript
User {
  uid, email, displayName, fullName, username
  isPremium, isEnterprise
  plannerCount, deletionCount
  subscriptionId, subscriptionStatus
}

Planner {
  id, userId, title, topic, dueDate
  assignmentType, requirements, deliverables, resources
  tasks[], progress, showTips
  createdAt, updatedAt
}

Task {
  id, name, description, tip
  startDate, endDate, completed
  priority, estimatedHours
}

UserPreferences {
  fontSize, theme, highContrast, reducedMotion
  autoSave, notificationsEnabled
  pomodoroSettings
}
```

**Business Logic**:
- Assignment type-specific configurations (essays, coding, presentations, research, design)
- Smart task breakdown with phase-based planning
- Urgency calculation based on due dates and time remaining
- Progress tracking across planners and tasks

### Feature Modules

**Core Features**:
1. **AI-Powered Planning**: Generates customized task breakdowns
2. **Progress Tracking**: Visual indicators and completion percentages
3. **Schedule Management**: Calendar views and deadline tracking
4. **Insights & Analytics**: Productivity metrics and completion rates
5. **PDF Export**: html2pdf.js for generating printable plans

**Student Tools** (Productivity Hub):
1. **Pomodoro Timer**: Configurable work/break intervals
2. **Citation Builder**: Academic citation generation
3. **Burnout Detector**: Wellness tracking
4. **Voice Memos**: Note-taking functionality
5. **Study Groups**: Collaboration features

**User Experience**:
- Theme switching (light/dark/system)
- Accessibility preferences (font size, high contrast, reduced motion)
- Responsive sidebar navigation
- Real-time notifications (browser API)
- Offline-first design with local storage fallback

### Architecture Decisions

**Progressive Web App (PWA)**:
- Manifest file for installability
- Service worker ready structure
- **Rationale**: Enables app-like experience on mobile devices and offline access

**Type Safety**:
- Full TypeScript implementation
- Strict type checking enabled
- **Rationale**: Catches errors at compile time, improves maintainability, enhances developer experience

**Client-Side Rendering for Dashboard**:
- Dashboard is fully client-rendered with "use client" directive
- **Rationale**: Highly interactive interface with real-time updates requires client-side state management

**Modular Component Architecture**:
- Separate view components (PlannerView, InsightView, ScheduleView, etc.)
- Shared UI components in /components/ui
- **Rationale**: Improves code organization, reusability, and testability

## External Dependencies

### Third-Party Services

**Firebase (Google Cloud)**:
- **Firebase Authentication**: User authentication and session management
- **Cloud Firestore**: NoSQL database for user data and planners
- **Purpose**: Production-ready backend infrastructure with real-time sync
- **Configuration**: Environment variables for API keys and project configuration

**Google Gemini AI**:
- **Service**: Generative AI for assignment planning
- **Purpose**: Intelligent task breakdown generation based on assignment context
- **API**: Direct API integration (requires API key)

### External Libraries

**UI & Styling**:
- `next-themes`: Theme management (light/dark mode)
- `tailwindcss`: Utility-first CSS framework
- `@radix-ui/*`: Accessible component primitives (18+ packages)
- `lucide-react`: Icon library
- `class-variance-authority`, `clsx`, `tailwind-merge`: Styling utilities

**Forms & Validation**:
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Form validation

**Features**:
- `html2pdf.js`: PDF generation for assignment plans
- `date-fns`: Date manipulation and formatting
- `embla-carousel-react`: Carousel/slider component
- `cmdk`: Command palette interface

**Development**:
- `autoprefixer`: CSS vendor prefixing
- `geist`: Font family (Vercel's typeface)

### Browser APIs

- **Notification API**: Task reminders and deadline alerts
- **LocalStorage**: Offline data persistence
- **MediaDevices API**: Voice memo recording (planned feature)

### Configuration Files

- `components.json`: shadcn/ui configuration
- `tailwind.config.ts`: Tailwind CSS customization
- `tsconfig.json`: TypeScript compiler options
- `next.config.js`: Next.js framework configuration (implicit)

### Environment Variables Required

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_GEMINI_API_KEY (implied by AI service)
```