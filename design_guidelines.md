# Multiplayer Learning Quiz - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from Kahoot's energetic quiz experience, Discord's real-time social features, and modern gaming interfaces with vibrant neon aesthetics. This creates an engaging, competitive atmosphere that makes learning feel like an exciting multiplayer game.

**Core Design Principles**:
- Energy & Competition: Bold colors and dynamic animations that amplify the competitive spirit
- Real-time Feedback: Instant visual responses to every action and score change
- Social Connection: Warm, inviting design that encourages player interaction
- Clarity Under Pressure: Clean information hierarchy even during timed gameplay

---

## Color Palette

**Dark Mode Primary** (Main theme):
- Background Base: 240 8% 12% (deep navy-black)
- Surface: 240 8% 16% (elevated dark surface)
- Neon Primary: 280 85% 65% (electric purple)
- Neon Accent: 180 75% 55% (cyan blue)

**Interactive States**:
- Correct Answer: 142 76% 55% (vibrant green)
- Wrong Answer: 0 84% 60% (bright red)
- Warning/Timer: 38 92% 58% (electric orange)

**Gradient Backgrounds**:
- Hero Gradient: From 280 85% 25% to 240 75% 20% (purple to deep blue)
- Success Gradient: From 142 76% 45% to 180 75% 50% (green to cyan)

---

## Typography

**Font Families**:
- Primary: 'Inter' (700, 600, 500, 400) - crisp, modern readability
- Display: 'Outfit' (800, 700) - bold headlines and scores
- Monospace: 'JetBrains Mono' (600) - room codes and timers

**Type Scale**:
- Display (Hero): text-6xl md:text-7xl font-800 (Outfit)
- H1 (Page titles): text-4xl md:text-5xl font-700
- H2 (Section heads): text-2xl md:text-3xl font-600
- Body: text-base md:text-lg font-400
- Small (metadata): text-sm font-500

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Micro spacing (gaps, padding): 2, 4
- Component spacing: 6, 8
- Section spacing: 12, 16, 20
- Page margins: 24

**Grid System**:
- Container: max-w-7xl mx-auto px-4 md:px-6
- Quiz Layout: Single column mobile, sidebar leaderboard on lg+ screens
- Lobby Grid: Grid of player cards (grid-cols-2 md:grid-cols-3 lg:grid-cols-4)

---

## Component Library

### Navigation & Headers
- Fixed top bar with room code display (monospace font, gradient background)
- Player count indicator with live dot animation
- Minimal nav for lobby/quiz states

### Cards & Containers
- Glass-morphism effect: backdrop-blur-xl bg-white/10 border border-white/20
- Quiz answer cards: Large touch targets (min-h-16), rounded-2xl, hover scale transform
- Player cards: Avatar + name + score, with animated rank badges

### Buttons & Interactive Elements
**Primary CTA**: 
- Gradient background (purple to cyan), text-white, px-8 py-4, rounded-xl
- Hover: slight scale (scale-105), increased shadow
- Active: scale-95

**Answer Buttons**:
- Default: bg-surface border-2 border-white/30, text-white
- Hover: border-neon-primary bg-white/5
- Selected: border-neon-primary bg-neon-primary/20
- Correct: animate-pulse border-green bg-green/20
- Wrong: shake animation border-red bg-red/20

### Data Displays
**Leaderboard**:
- Animated horizontal bars showing scores (framer-motion or CSS transitions)
- Top 3 players with medal icons (🥇🥈🥉) and glow effects
- Real-time score counter with number roll animation
- Rank changes with up/down arrow indicators

**Timer Progress Bar**:
- Full-width gradient bar (green → yellow → red as time depletes)
- Smooth width transition, pulse animation when < 10s remaining
- Numeric countdown in top-right corner

**Score Display**:
- Large, bold numbers (Outfit font, text-5xl)
- Subtle glow effect for score increases (+50 floating animation)
- Streak multiplier badge (e.g., "🔥 3x Streak")

### Forms & Input
**Room Code Input**:
- Large, centered monospace input (text-3xl, letter-spacing-widest)
- Auto-uppercase, 6-character limit
- Gradient border on focus

**Chat/Reactions**:
- Floating panel with glass-morphism
- Emoji quick-reactions (👍❤️😂🔥💯) as large clickable buttons
- Message bubbles with player avatar and timestamp

### Overlays & Modals
- Full-screen overlay for results: backdrop-blur-2xl bg-black/60
- Modal cards: centered, animated scale-in entrance
- Confetti canvas layer (z-50) for celebrations

---

## Page-Specific Designs

### Landing Page
**Hero Section** (90vh):
- Full-screen gradient background with animated orbs (SVG or CSS)
- Centered content: Logo/Title (text-7xl), tagline, two large CTAs
- "Create Room" (gradient primary), "Join Room" (outline with blur bg)
- Floating quiz icons or question marks (subtle parallax)

**How It Works** (py-20):
- 3-column grid (stacked mobile): Step number, icon, description
- Connect steps with dotted lines on desktop

### Room Lobby
**Header**: Room code in large display (with copy button), player count
**Main Area** (grid layout):
- Player grid: Animated cards that slide in as users join
- Each card: Avatar (or initials), name, "Ready" checkbox
- Ready all button at bottom (disabled until all ready)

**Sidebar** (desktop only, lg:block):
- Live chat with glass panel
- Emoji reactions bar at bottom

### Quiz Page
**Layout** (desktop: grid grid-cols-[1fr_320px], mobile: stack):

**Main Panel**:
- Question header with progress indicator (Question 3/10)
- Large question text (text-3xl, max-w-3xl)
- 2x2 grid of answer buttons (or 4 rows mobile)
- Timer bar spanning full width at bottom

**Leaderboard Sidebar** (fixed on desktop, collapsible mobile):
- Top 5 players with animated bars
- User's own rank highlighted if not in top 5
- Score changes with green ↑ or red ↓ indicators

### Results Page
**Winner Announcement** (80vh):
- Confetti animation (canvas element, z-50)
- Top 3 podium visual (1st center/higher, 2nd left, 3rd right)
- Player avatars with crowns/medals
- Final scores with glow effects

**Full Rankings** (below fold):
- Expandable list with all players
- Rank, name, score, accuracy percentage
- Highlight current user's row

**Action Bar** (sticky bottom):
- "Play Again" (primary gradient), "New Quiz" (outline), "Share Results" (ghost)

---

## Animations

**Page Transitions**: Fade + slight slide-up (200ms duration)
**Score Updates**: Number count-up with scale pulse
**Answer Feedback**: 
- Correct: Green glow + confetti burst
- Wrong: Red flash + shake (200ms)
**Leaderboard**: Smooth bar width changes (500ms ease-out)
**Loading States**: Gradient shimmer on skeleton cards

---

## Images

**Landing Page Hero**: Large background image or abstract animated gradient with floating geometric shapes. Alternatively, a collage of diverse people competing in a quiz (energetic, colorful, community-focused).

**Results Page**: Confetti and celebration imagery as background overlays (subtle, not distracting from rankings).

**Lobby Page**: Optional background pattern or subtle texture to distinguish from quiz state.

Note: All images should support the neon/vibrant theme with slight blur or overlay to maintain text readability.