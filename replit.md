# QuizBattle - Multiplayer Learning Quiz

## Overview

QuizBattle is a real-time multiplayer quiz application inspired by Kahoot, featuring live competitive gameplay, instant score updates, and social interactions. Players join rooms using unique codes, answer timed multiple-choice questions, and compete on a dynamic leaderboard with visual feedback and celebrations.

The application emphasizes energy and competition through bold neon aesthetics, real-time responsiveness, and clear information hierarchy during timed gameplay.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing (pages: Home, CreateRoom, Lobby, Quiz, Results)

**UI Component System**
- **shadcn/ui** components based on Radix UI primitives for accessible, composable UI elements
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Design System**: Dark mode primary with neon purple/cyan accents, following design guidelines in `design_guidelines.md`
- Custom CSS variables for theming (background, foreground, card, primary, destructive states)

**State Management**
- **TanStack Query (React Query)** for server state management and caching
- **WebSocket Context** (`websocket-context.tsx`) for real-time game state (players, questions, scores, chat)
- Local component state with React hooks for UI interactions

**Real-time Communication**
- WebSocket connection at `/ws` endpoint for bi-directional communication
- Message types: `join_room`, `set_ready`, `start_game`, `submit_answer`, `send_emoji`
- Real-time updates for: player list, game status, questions, leaderboard, chat/reactions

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- **HTTP Server** wrapped with WebSocket server for dual protocol support
- Vite integration for development mode with HMR

**WebSocket Server**
- **ws** library for WebSocket implementation
- Connection tracking via Maps: `playerConnections`, `roomConnections`
- Room-based message broadcasting
- Event-driven architecture for game flow (join, ready, start, answer, finish)

**Data Storage**
- **In-Memory Storage** (`MemStorage` class) for MVP implementation
- Structured interfaces for future database migration (IStorage interface)
- Entity types: Rooms, Players, Answers, ChatMessages
- Room lifecycle: lobby → playing → finished

**Game Logic**
- Sample questions stored in `SAMPLE_QUESTIONS` constant
- Score calculation: base points + speed bonus + streak multiplier
- Timer-based question progression (server-controlled)
- Answer validation and leaderboard updates

### Data Storage Solutions

**Current: In-Memory Storage**
- JavaScript Maps for all data (rooms, players, answers, chat)
- Volatile storage - data lost on server restart
- Suitable for MVP and testing
- Implements `IStorage` interface for easy migration

**Prepared for: PostgreSQL with Drizzle ORM**
- Schema defined in `shared/schema.ts` with Drizzle tables for rooms and players
- Drizzle configuration in `drizzle.config.ts` pointing to PostgreSQL
- Neon Database serverless driver (`@neondatabase/serverless`) included
- Migration scripts ready: `npm run db:push`

**Data Models**
- **Room**: id, code (6-char), status, currentQuestion, createdAt
- **Player**: id, name, roomId, score, streak, ready, isHost, joinedAt
- **Question**: id, text, options[], correctAnswer, timeLimit, category (in-memory)
- **Answer**: playerId, questionId, selectedAnswer, timeTaken, isCorrect, pointsEarned (in-memory)
- **ChatMessage**: id, playerId, playerName, roomId, emoji, message, timestamp (in-memory)

### External Dependencies

**UI & Components**
- Radix UI primitives (@radix-ui/*) - Accessible component primitives for dialog, dropdown, toast, etc.
- canvas-confetti - Celebration animations on results page
- lucide-react - Icon library

**Styling**
- Tailwind CSS - Utility-first CSS framework
- class-variance-authority - Component variant management
- clsx & tailwind-merge - Conditional className utilities

**Real-time**
- ws (WebSocket) - Server-side WebSocket implementation
- Native WebSocket API - Client-side WebSocket connections

**Data & Forms**
- @tanstack/react-query - Server state management and caching
- react-hook-form - Form state and validation
- @hookform/resolvers - Form validation resolvers
- zod & drizzle-zod - Schema validation

**Database (Prepared)**
- @neondatabase/serverless - Neon Database PostgreSQL driver
- drizzle-orm - TypeScript ORM
- drizzle-kit - Database migrations and schema management

**Development Tools**
- TypeScript - Type safety across stack
- Vite plugins: @replit/vite-plugin-runtime-error-modal, @replit/vite-plugin-cartographer, @replit/vite-plugin-dev-banner
- tsx - TypeScript execution for development server

**Fonts**
- Google Fonts: Inter (primary), Outfit (display/headlines), JetBrains Mono (monospace for codes/timers)