# Design Guidelines: Steam/Epic Games-Inspired Game Distribution Platform

## Design Approach
**Reference-Based**: Drawing primary inspiration from Steam and Epic Games Store, with emphasis on their sophisticated dark interfaces, bold typography, and immersive gaming-focused experiences. This platform prioritizes visual impact and discoverability while maintaining utility for admin functions.

## Typography System

**Display & Headers**
- Hero/Featured: Bold sans-serif at 48-56px (Montserrat Bold or similar via Google Fonts)
- Section Headers: Semi-bold 32-40px
- Card Titles: Bold 18-20px
- Button Text: Semi-bold 14-16px uppercase with letter-spacing

**Body & UI**
- Primary Body: Regular 14-16px (Inter or Roboto)
- Captions/Meta: Regular 12-14px
- Admin Forms: Medium 14px

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-24
- Card gaps: gap-6 to gap-8
- Container max-width: max-w-7xl with px-6

## Core Components

### Navigation Header
Full-width sticky header with:
- Platform logo (left)
- Primary navigation links (Library, Store, Community)
- Search bar (center-right, expandable)
- User profile dropdown (right) showing license status badge
- Admin panel link (visible only for admin)
Height: h-16 to h-20

### Hero Section (Landing Page)
Large featured game showcase:
- Full-width container with max-w-7xl
- Height: 60vh to 70vh
- Featured game background (blur overlay for readability)
- Left-aligned content area (max-w-2xl):
  - Game title (56px bold)
  - Tagline/description (18px)
  - CTA buttons with backdrop blur (Download Now, Learn More)
- Right side: Featured game trailer/screenshot preview

### Game Cards (Library Grid)
Primary game display format:
- Fixed aspect ratio container (460x215 standard)
- Image overlay with gradient on hover
- Bottom info bar:
  - Game title (bold 18px)
  - Category tags (small badges)
  - Download/Play button (appears on hover)
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Card spacing: gap-6

### Admin Dashboard Layout
Two-column layout:
- Left sidebar (w-64):
  - Navigation menu (Dashboard, Games, Licenses, Users, Analytics)
  - Active state indicators
  - Logout button at bottom
- Main content area:
  - Page header with title and action button
  - Statistics cards (4-column grid for metrics)
  - Data tables with alternating row styling
  - Form sections with clear field groupings

### License Management Interface
- License key display: Monospace font, copyable cards
- Status badges (Active/Expired/Revoked) as pill shapes
- Creation form: Single-column with focused inputs
- License list: Table view with search and filter bar

### Game Detail Modal/Page
Large modal overlay or dedicated page:
- Hero image section (full-width, 40vh)
- Two-column content below:
  - Left (2/3): Description, features, screenshots gallery
  - Right (1/3): Sidebar with download button, metadata, system requirements
- Screenshots: Horizontal scrollable gallery with thumbnails

### User Library View
Personalized game collection:
- Filter bar (All Games, Recently Played, Categories)
- Sort dropdown (Alphabetical, Recently Added, Most Played)
- Game grid matching store layout
- "Continue Playing" section at top (horizontal scroll)
- Empty state with invitation to browse store

### Admin Game Management
Form-based interface:
- Large input sections with clear labels
- Image URL preview (shows 460x215 ratio)
- Rich text editor for description
- Tag selector (multi-select dropdown)
- Category assignment
- Download link configuration
- Save/Cancel action bar (sticky bottom)

## Component Library

**Buttons**
- Primary: Large padding (px-8 py-4), bold text, full corner radius
- Secondary: Outlined style, same sizing
- Icon buttons: Square (h-12 w-12) for utility actions
- Backdrop blur applied to buttons over images

**Form Inputs**
- Height: h-12 for text inputs
- Border radius: rounded-lg
- Focus states: Ring offset for clarity
- Labels: Above input, semi-bold 14px
- Validation messages: Below field, 12px

**Cards**
- Container: Rounded corners (rounded-xl)
- Padding: p-6 for content cards
- Shadow: Elevated appearance on hover
- Borders: Subtle 1px outline

**Badges/Tags**
- Pill shape (rounded-full)
- Small padding (px-3 py-1)
- Uppercase 11px text
- Used for: Categories, license status, game tags

**Data Tables**
- Header row: Bold, uppercase 12px
- Row height: h-16
- Alternating row treatment for readability
- Hover state on rows
- Action buttons in rightmost column

**Modals/Overlays**
- Backdrop: Semi-transparent overlay
- Modal width: max-w-4xl for game details, max-w-md for confirmations
- Close button: Top-right corner (X icon)
- Padding: p-8

## Images

**Hero Section Image**
- Large hero image required for landing page
- Blurred version as background with sharp featured game artwork overlay
- Placement: Full-width background with content overlay
- Format: High-quality gaming artwork or screenshot

**Game Card Images**
- Mandatory 460x215 ratio for all game cards
- Display in grid layout across library
- Hover effect reveals additional info overlay
- Placeholder for games without images: Solid background with game title

**Additional Images**
- Game detail screenshots: 16:9 ratio, gallery format
- User avatars: Circular, 40x40px in header, 80x80px in profile
- Admin analytics: Chart visualizations for metrics

## Animation Strategy

Use sparingly for polish:
- Card hover: Subtle lift (transform scale 1.02)
- Button interactions: Quick opacity transitions
- Modal entry/exit: Smooth fade and scale
- Page transitions: None (instant navigation preferred for speed)

## Responsive Behavior

Desktop-first approach (gaming platforms are desktop-primary):
- Desktop (1280px+): Full 4-column game grid, expanded sidebar
- Laptop (1024px): 3-column grid, condensed sidebar
- Tablet (768px): 2-column grid, collapsible sidebar
- Mobile (640px-): Single column, hamburger menu, stacked layout

## Key Screens Layout

**Landing Page**: Hero → Featured Games Carousel → Recently Added Grid → Categories Section → Footer
**Library**: Filter Bar → Continue Playing (horizontal) → All Games Grid
**Admin Dashboard**: Sidebar → Stats Cards → Quick Actions → Recent Activity Table
**Game Detail**: Hero Image → Two-column (Description | Download Sidebar) → Screenshots Gallery → Related Games

This design creates an immersive, professional gaming platform experience that balances visual impact with administrative functionality.