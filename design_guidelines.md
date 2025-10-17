# Phoenix Games - Design Guidelines

## Design Approach: Gaming Platform Reference-Based

**Primary References**: Steam, Epic Games Store, itch.io - combining professional game marketplace aesthetics with phoenix fire energy

**Core Principle**: Bold, energetic gaming platform with fiery phoenix branding, balanced with functional clarity for admin and user management systems

---

## Color Palette

### Brand Colors (Dark Mode Primary)
- **Background Base**: 15 8% 10% (deep charcoal)
- **Surface**: 15 10% 15% (elevated dark surface)
- **Phoenix Primary**: 25 95% 55% (vibrant fiery orange)
- **Phoenix Accent**: 10 90% 50% (deep ember red)
- **Text Primary**: 40 10% 95% (warm white)
- **Text Secondary**: 40 5% 70% (muted warm gray)

### Functional Colors
- **Success**: 142 76% 45% (emerald for approved requests)
- **Warning**: 38 92% 50% (amber for pending)
- **Error**: 0 84% 60% (red for rejections)
- **Info**: 217 91% 60% (blue for notifications)

### Light Mode (Optional Toggle)
- **Background**: 40 15% 97%
- **Surface**: 40 10% 100%
- Phoenix colors remain saturated for brand consistency

---

## Typography

**Font Stack**: 
- **Primary**: 'Inter', system-ui, sans-serif (Google Fonts CDN)
- **Display/Brand**: 'Orbitron', sans-serif for Phoenix Games logo and section headers (gaming tech feel)

**Scale**:
- **Hero/Display**: text-5xl to text-7xl, font-bold (Orbitron)
- **Section Headers**: text-3xl to text-4xl, font-semibold
- **Card Titles**: text-xl, font-semibold
- **Body**: text-base, font-normal
- **Captions**: text-sm, text-muted-foreground

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- **Component padding**: p-4, p-6, p-8
- **Section spacing**: space-y-8, space-y-12
- **Card gaps**: gap-6, gap-8
- **Container**: max-w-7xl mx-auto px-4

**Grid System**:
- **Game Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- **Admin Tables**: Full-width responsive tables with horizontal scroll on mobile
- **Dashboard Metrics**: grid-cols-2 lg:grid-cols-4 for stat cards

---

## Component Library

### Navigation
- **Header**: Sticky dark navbar with phoenix logo (left), nav links (center), user menu (right)
- **Admin Sidebar**: Fixed left sidebar (240px) with role-based menu items, collapsible on mobile
- **Breadcrumbs**: Secondary navigation in admin panel with chevron separators

### Game Cards
- **Design**: Elevated cards with hover lift effect, aspect-ratio-[3/4] game cover image
- **Content**: Image top, gradient overlay for title, category badge, download button
- **States**: Hover reveals full description and additional metadata

### Forms & Inputs
- **Style**: Dark inputs with subtle borders, focus state with phoenix orange ring
- **Admin Forms**: Multi-step upload wizard for games, file upload with drag-drop
- **Validation**: Inline error messages in red, success states in green

### Data Display
- **Tables**: Striped rows, sortable columns, action buttons (edit/delete) in final column
- **Support Tickets**: Card-based list with status badges, priority indicators
- **Game Requests**: Similar card layout with approve/reject action buttons

### Modals & Overlays
- **Game Details**: Full-screen modal with large image, comprehensive info, download CTA
- **Confirmation Dialogs**: Centered modals with destructive actions clearly marked
- **Toast Notifications**: Top-right position, slide-in animation, 4s auto-dismiss

### Authentication Pages
- **Layout**: Split-screen design - left side with phoenix illustration/branding, right side with form
- **Forms**: Clean, centered forms with social login dividers (even if not used, keep for future)

---

## Images

### Hero Section (Homepage)
**Large Hero Image**: Yes - Full-width hero featuring phoenix fire artwork or gaming montage
- **Placement**: Above game grid, 60vh height
- **Overlay**: Dark gradient (bottom-to-top) for text readability
- **Content**: "Phoenix Games" wordmark, tagline "Ignite Your Gaming Experience", browse CTA

### Game Cards
**Game Cover Images**: Required for each game card
- **Aspect Ratio**: 3:4 portrait (standard game cover)
- **Fallback**: Phoenix logo watermark on dark background if no image

### Admin Panel
**Dashboard Graphics**: Optional data visualization charts, minimal decorative images
**Empty States**: Phoenix-themed illustrations for "no games uploaded yet"

### Authentication Pages  
**Branding Image**: Phoenix logo/illustration on left split panel
**Background**: Subtle flame particle effect (CSS/lightweight animation)

---

## Animations

**Minimal & Purposeful**:
- **Card Hover**: Subtle lift (translateY -4px) with shadow increase, 200ms ease
- **Button Press**: Scale down to 0.98, 100ms
- **Page Transitions**: Fade-in content on route change, 300ms
- **Loading States**: Phoenix logo pulse/glow effect for data fetching
- **NO**: Excessive scroll animations, auto-playing backgrounds, distracting particles

---

## Accessibility & Responsiveness

- **Dark Mode**: Default theme, maintain high contrast ratios (WCAG AA)
- **Mobile**: Bottom navigation for key actions, collapsible admin sidebar
- **Focus States**: Visible focus rings in phoenix orange
- **Screen Readers**: Proper ARIA labels for admin actions, status indicators
- **Touch Targets**: Minimum 44x44px for mobile buttons

---

## Phoenix Games Brand Identity

**Personality**: Energetic, bold, modern gaming hub with professional admin tools
**Visual Metaphor**: Rising phoenix = new game discoveries, community growth
**Logo Usage**: Header (40px height), favicon, loading screens, empty states
**Tagline**: "Ignite Your Gaming Experience" or "Where Games Take Flight"

---

## Special Sections

### Homepage Game Gallery
- Masonry grid if varied game cover sizes, otherwise uniform grid
- Featured games carousel/banner at top
- Search bar with filter chips (category, platform)

### Admin Dashboard
- Metric cards showing total games, users, pending requests, open tickets
- Recent activity feed
- Quick action buttons for common tasks

### Support System
- Ticket list with color-coded priority (red: urgent, yellow: medium, green: low)
- Chat-style interface for ticket conversations
- Admin can attach responses, change status, assign tickets

### Game Request Page
- User submission form with game details
- Admin approval queue with preview cards
- Approved requests automatically create game entry template