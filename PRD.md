# Product Requirements Document: Flight Search Engine

**Version:** 1.0  
**Date:** 2026-01-15  
**Status:** Approved for Implementation  
**Owner:** Senior Product Engineer / Frontend Architect

---

## 1. Project Overview

**Product Name:** Flight Search Engine  
**Goal:** Build a premium, demonstrative flight search application that balances functional depth (real-time filtering, price visualization) with aesthetic excellence and architectural rigour. The application serves as a technical showcase of modern frontend capabilities using Next.js, TypeScript, and Tailwind CSS.

**Target User:** The "Smart Traveler" – a user who optimizes for price and convenience, comfortable with data visualizations to make informed decisions.

**Timeline:** 4 Days (Maximum 16 hours engineering time).

---

## 2. Primary Objectives

1.  **Seamless Search Experience:** Intuitive input handling for finding flights by origin, destination, and date.
2.  **Instant Visual Feedback:** A real-time price trend graph that reacts immediately to user interactions (filtering).
3.  **High-Performance Filtering:** Client-side filtering of flight results that feels instantaneous (<16ms frame budget).
4.  **Architectural Integrity:** A clean, maintainable codebase demonstrating separation of concerns, strict typing, and modular component design.
5.  **Aesthetic "Wow" Factor:** A modern, polished UI that goes beyond utility to delight the user (smooth transitions, skeleton states, thoughtful typography).

---

## 3. Technical Stack & Constraints

*   **Framework:** Next.js 15+ (App Router)
*   **Language:** TypeScript (Strict mode enabled)
*   **Styling:** Tailwind CSS v4 (Mobile-first, Utility-first)
*   **Component Library:** Shadcn UI (Radix Primitives) + Lucide Icons
*   **State Management:** Zustand (Global store for search state & results)
*   **Data Visualization:** Recharts (Responsive price trend charts)
*   **Data Source:** Mock Data Generator (Primary for stability/speed) or Amadeus API (Secondary/Optional if reliable). *Architectural decision: Abstract the data layer so the source can be swapped.*
*   **Testing/Quality:** ESLint, Prettier.
*   **Deployment:** Vercel.

---

## 4. Functional Requirements

### 4.1 Search Interface
**Location:** Homepage Hero Section / Top Bar on Results

*   **Inputs:**
    *   **Origin:** Text input with autocomplete (Airports/Cities).
    *   **Destination:** Text input with autocomplete.
    *   **Departure Date:** Date picker (disable past dates).
    *   **Return Date:** Optional.
*   **Validation:** Search button disabled until Origin, Destination, and Departure Date are valid.
*   **Behavior:**
    *   On submit, validate and push router state (URL params) to `/search`.
    *   Show loading state on button during initial fetch.

### 4.2 Flight Results Page
**Location:** `/search`

*   **Layout:** Responsive split view (List + Graph).
*   **Loading State:** Skeleton loaders reflecting the card layout exactly.
*   **Result Card:**
    *   **Header:** Airline Logo + Name.
    *   **Route:** Origin Code (Time) → Arrow → Dest Code (Time).
    *   **Duration:** Total time formatted (e.g., "5h 20m").
    *   **Segments:** "Direct" or "1 Stop (LHR)".
    *   **Price:** Prominent display (e.g., "$350").
    *   **Footer:** "Select" button.
*   **Zero State:** "No flights found matching your filters." with a "Reset Filters" action.

### 4.3 Live Price Analysis (The "Wow" Feature)
**Location:** Top of results list (Mobile) or Sticky Sidebar/Top Panel (Desktop).

*   **Visualization:** Area chart showing Price (Y) vs. Time/Airline (X).
*   **Interactivity:**
    *   **Reactive:** Graph data must represent the *currently filtered* flight list.
    *   **Hover:** Tooltip showing exact price details for a data point.
    *   **Animation:** Smooth transition when data updates (e.g., stops filter applied removes expensive non-stop flights from graph).

### 4.4 Advanced Filtering
**Location:** Sidebar (Desktop) / Bottom Sheet (Mobile).

*   **Filter Types:**
    *   **Stops:** Checkbox group (Direct, 1 Stop, 2+ Stops).
    *   **Price Range:** Dual-thumb slider (Min - Max).
    *   **Airlines:** Multi-select checkboxes.
    *   **Time:** Toggle for Morning/Afternoon/Evening (Bonus).
*   **Technical Implementation:**
    *   **Optimistic UI:** UI updates immediately.
    *   **Debouncing:** expensive re-calculations debounced by 300ms if needed (though client-side filtering 100-500 items should be instant).
    *   **Synchronization:** Changing a filter updates:
        1.  Flight List
        2.  Price Graph
        3.  URL Query Parameters (for shareability).

### 4.5 Responsive Experience
*   **Mobile (< 768px):**
    *   Full-width Result Cards.
    *   Filters accessible via a floating action button (FAB) or sticky bottom bar trigger.
    *   Graph collapsed or simplified.
*   **Desktop (>= 1024px):**
    *   2-Column Layout: Left Sidebar (Filters), Right Content (Graph + List).
    *   Sticky Filter sidebar.

---

## 5. System Architecture

### 5.1 Component Hierarchy
```text
RootLayout
└── Providers (QueryClient?, ThemeProvider)
    └── Page (Home)
    └── Page (Search)
        ├── SearchHeader (Inputs)
        └── SearchLayout
            ├── FilterSidebar (Desktop) / FilterSheet (Mobile)
            │   ├── PriceSlider
            │   ├── StopSelect
            │   └── AirlineSelect
            └── ResultsContainer
                ├── PriceHistoryChart (Recharts)
                └── FlightList
                    ├── FlightCard
                    └── Pagination / InfiniteScroll
```

### 5.2 Data Flow & State (Zustand)

**Store:** `useFlightStore`

*   **State:**
    *   `rawFlights`: Flight[] (All fetched results)
    *   `filters`: { maxPrice, stops, airlines[] }
    *   `isLoading`: boolean
    *   `error`: string | null
    *   `sortBy`: 'price' | 'duration' | 'fastest'
*   **Actions:**
    *   `setFlights(flights)`
    *   `updateFilter(key, value)`
    *   `resetFilters()`
*   **Selectors (Computed):**
    *   `filteredFlights`: Derived from `rawFlights` + `filters`. Used by List & Chart.
    *   `minPrice` / `maxPrice`: Derived from `rawFlights` for slider bounds.

### 5.3 Data Integration Layer
*   **Path:** `lib/api`
*   **Pattern:** Repository pattern or Adapter pattern.
*   **Interface:** `FlightService.search(params)`
    *   Implemented by `AmadeusService` (Real) or `MockService` (Dev).
    *   Returns normalized `Flight` objects to decouple UI from API shape.

---

## 6. Suggested Folder Structure (Next.js App Router)

```text
/app
  /search
    page.tsx       # Search Results Page (Server Component)
    layout.tsx     # Layout for search (optional wrapper)
  page.tsx         # Landing Page
  layout.tsx       # Root Layout
  globals.css      # Tailwind imports

/components
  /ui              # Reusable atoms (Button, Card, Slider - Shadcn)
  /features
    /search
      SearchForm.tsx
      FilterSidebar.tsx
    /results
      FlightCard.tsx
      FlightList.tsx
      PriceChart.tsx
  /layout
    Header.tsx
    Footer.tsx

/lib
  /api
    types.ts       # API response types
    client.ts      # Fetch wrapper
    mock-data.ts   # Fallback data
  /utils
    formatting.ts  # Date/Currency formatters
  /constants
    airports.ts    # Autocomplete data

/store
  use-search-store.ts  # Zustand store

/hooks
  use-search-filters.ts # Hook for handling filter logic if complex
```

---

## 7. Edge Cases & Handling

1.  **No Results:**
    *   *Trigger:* Strict filters or obscure route.
    *   *UI:* Friendly illustration "No lights found". Suggest "Remove filters".
2.  **API Failure:**
    *   *Trigger:* Rate limit or network error.
    *   *UI:* Toast notification (Error variant). "Showing cached/demo results".
3.  **Loading Latency:**
    *   *UI:* Display Skeleton Cards (3-5 items) immediately. Prevent layout shift.
4.  **Currency:**
    *   Assume USD ($) for MVP to reduce complexity.

---

## 8. UX & Styling Guidelines (Tailwind)

*   **Color Palette:**
    *   Primary: `indigo-600` (Trust, Aviation)
    *   Background: `slate-50` (Lists), `white` (Cards)
    *   Text: `slate-900` (Headings), `slate-500` (Meta info)
    *   Accents: `emerald-500` (Good Price), `rose-500` (Expensive/Alert)
*   **Typography:**
    *   Sans-serif (Inter or system stack).
    *   **Bold** prices.
    *   *Legible* flight times (24h or AM/PM consistent).
*   **Spacing:**
    *   Comfortable whitespace. `gap-4` for lists, `p-6` for cards.

---

## 9. Deliverables Checkpoints

1.  **Phase 1: Foundation (Hours 0-4):**
    *   Project setup (Next.js, Tailwind, Zustand).
    *   Mock data generation.
    *   Basic Component Library setup (Shadcn items).

2.  **Phase 2: Core Search (Hours 4-8):**
    *   Search Form logic.
    *   Flight Result Card design.
    *   List rendering.

3.  **Phase 3: Logic & Visualization (Hours 8-12):**
    *   Filter logic (The "Brain").
    *   Recharts implementation linked to Filter Store.
    *   Responsive layouts.

4.  **Phase 4: Polish (Hours 12-16):**
    *   Animations (Framer Motion or CSS transitions).
    *   Edge case screens.
    *   Code cleanup & README.

---
