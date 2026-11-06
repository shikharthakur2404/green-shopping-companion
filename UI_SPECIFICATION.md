# GreenStep — User Interface Specification & Design System

A comprehensive guide to the UI architecture, visual design system, typography, components, and interaction patterns implemented in the **Green Shopping Companion (GreenStep)**.

---

## 1. Design Philosophy: Human-Crafted vs. AI Clichés

Most AI-generated dashboards suffer from recognizable tropes: neon green radial gradients, dashed borders (`border-dashed`), military "HUD" crosshairs, and excessive uppercase letter-spacing (`tracking-[0.2em]`).

GreenStep adopts an **editorial, product-first minimalist aesthetic** inspired by modern transit apps (Citymapper, Apple Maps) and high-craft software (Linear, Raycast):

* **Calm Surfaces:** Deep charcoal bases (`#07110c` and `#0c1510`) replacing harsh neon gradients with subtle 1px solid structural borders (`border-white/[0.07]`).
* **Solid Borders:** Clean, purposeful cards without decorative dashed outlines.
* **Readable Typography:** Sentence-case headings with tight negative tracking, paired with tabular monospaced numbers for scientific data.
* **Photography-Driven:** Real retail storefront imagery from curated high-resolution sources replacing generic vector placeholders.

---

## 2. Design Tokens & Color Palette

| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| **Canvas Base** | `#07110c` | Global background canvas |
| **Card Surface** | `#0e1a14` | Primary card panels, modal wrappers, search containers |
| **Card Elevate** | `#14241c` | Hover states, active dropdown items, secondary badges |
| **Border Neutral** | `rgba(255, 255, 255, 0.08)` | Structural 1px card and divider boundaries |
| **Border Active** | `rgba(52, 211, 153, 0.45)` | Selected store cards, focused search inputs |
| **Emerald Accent** | `#34d399` / `#10b981` | Greenest route highlight, 0g CO₂ indicators, action buttons |
| **Amber Warning** | `#fbbf24` | Solo car baseline penalty, API notice alerts |
| **Rose Alert** | `#f87171` | High-emission transport mode warnings |
| **Text Primary** | `#ecfdf5` | High-contrast headings and active metrics |
| **Text Secondary**| `rgba(209, 250, 229, 0.55)` | Addresses, store categories, subtitles |
| **Text Muted** | `rgba(209, 250, 229, 0.30)` | Helper hints, timestamps, metadata labels |

---

## 3. Typography System

The application uses a 3-font typographic hierarchy loaded directly via Google Fonts:

```css
/* Display & Major Titles */
font-family: 'Outfit', sans-serif;
font-weight: 600, 700, 800;
letter-spacing: -0.02em;

/* Body, Interface Labels, & Cards */
font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
font-weight: 400, 500, 600;

/* Scientific Readouts, Carbon Grams, & Distances */
font-family: 'JetBrains Mono', monospace;
font-feature-settings: 'tnum'; /* Tabular numbers for clean column alignment */
```

### Type Scale
* **Display H1:** `text-2xl font-bold tracking-tight text-emerald-50` (Top app bar & hero headers)
* **Section Title H2:** `text-lg font-semibold text-emerald-100` (Search panel & route comparison titles)
* **Store Title:** `text-sm font-bold text-emerald-50` (Store card headers)
* **Metadata & Captions:** `text-xs text-emerald-100/50` (Opening hours, street addresses)
* **Carbon Delta Metric:** `text-sm font-mono font-semibold text-emerald-300` (e.g., `+900 g CO₂ saved`)

---

## 4. Subpage & Navigation Architecture

To prevent cognitive overload, the interface is organized into **four dedicated views** accessible via the top navigation bar:

```
┌────────────────────────────────────────────────────────────────────────┐
│  🌿 GreenStep    [ Find & Compare ]  [ Calculator ]  [ Eco Tracker ]  [ Sources ]  │
└────────────────────────────────────────────────────────────────────────┘
```

### View 1: Find & Compare (`tab === 'find'`)
* **Store Search & Filtering:**
  * Live search input supporting brand names (*Adidas*, *Zara*, *H&M*), item types (*shoes*, *jeans*, *coat*), and categories.
  * Category pill filter (Fashion, Shoes, Department Stores, Sports, Vintage / Second-hand).
  * Geolocation header with **"Detect My Location"** button and quick-switch city presets (Nuremberg, Bucharest).
* **Store Cards:**
  * 1:1 curated photography thumbnail with category badges.
  * Distance readout calibrated to the user's real location (e.g., `2.2 km away`).
  * Real-time carbon rating badge (`A+`, `A`, `B`, `C`).
* **Interactive Map (Leaflet):**
  * Dark custom cartography (`CartoDB DarkMatter` / muted OpenStreetMap tiles).
  * Animated user pulsing beacon (`user-pin`).
  * Color-coded store markers (`store-pin`) with interactive popups showing store name, category, and distance.
  * Route polyline dynamically rendered from origin to the selected store.
* **Route Comparison Deck:**
  * Side-by-side modal cards comparing Walking, Cycling, E-Bike, Public Transit, EV, Petrol Car, and Consolidated Online Delivery.
  * Highlights the **"Greenest Option"** with a glowing green badge.
  * Shows exact grams of CO₂e emitted, travel time in minutes, and net savings vs driving.

### View 2: Carbon Calculator (`tab === 'calculator'`)
* **Interactive Distance Slider:**
  * Custom styled range slider from 1 km to 20 km round-trip.
* **Comparative Bar Visualizer:**
  * Proportional horizontal bar charts showing emissions across all 7 modes:
    * Walk / Bike: `0 g CO₂e`
    * E-Bike: `12 g CO₂e/km`
    * Light Rail / Tram: `29 g CO₂e/passenger-km`
    * City Bus: `89 g CO₂e/passenger-km`
    * Electric Car: `45 g CO₂e/km`
    * Petrol Car: `171 g CO₂e/km`
    * Online Delivery: `118 g CO₂e/parcel` flat baseline
* **The "Honest Trade-off" Insight Card:**
  * Contextual explanation highlighting when home delivery beats driving to a far-away mall.

### View 3: My Eco Tracker (`tab === 'tracker'`)
* **Progress Meter:**
  * Circular and linear progress bars tracking the user toward a 10 kg monthly CO₂ reduction target.
* **Equivalency Stats:**
  * Real-world equivalents (e.g., number of trees planted, smartphone charges saved, vehicle km avoided).
* **Habit Streaks:**
  * Consecutive days choosing low-carbon transport.
* **Shareable / Printable Impact Card:**
  * Clean, minimal summary designed for print/export to show campus or social proof.

### View 4: Methodology & Sources (`tab === 'methodology'`)
* **Government GHG Conversion Factor Table:**
  * Transparent disclosure of emission factors, measurement units, and reference standards (UK DESNZ 2025/2026, European Environment Agency).
* **Clickable Direct Citations:**
  * External links to official government and academic methodology publications.

---

## 5. Location & Distance Precision Calibration

### The 33-Meter Bug & Its Fix
* **Problem:** In early prototypes, Nuremberg was centered at `49.4521, 11.0767` (central Lorenzkirche pedestrian zone). Breuninger on Königstraße 1 sits at `49.45239, 11.07658`. The mathematical distance from the town square was only 33 meters, confusing users whose real location is 2.2 km away.
* **Correction Implemented:**
  1. The default fallback coordinates for Nuremberg are set to the **FAU Campus / Südstadt district** (`49.4380, 11.0880`), giving an accurate baseline road distance of **2.2 km** to downtown department stores.
  2. Live GPS (`navigator.geolocation.getCurrentPosition`) is requested automatically with high-accuracy mode so that whenever permission is granted, every distance matches Google Maps / Apple Maps exactly.

---

## 6. Component File Mapping

| Component | Path | Key Responsibilities |
| :--- | :--- | :--- |
| **`App.tsx`** | `src/App.tsx` | Master view router, tab management, geolocation state, store selection state |
| **`StoreSearch.tsx`** | `src/components/StoreSearch.tsx` | Search bar, category filters, store card list, photo thumbnails |
| **`Map.tsx`** | `src/components/Map.tsx` | Leaflet map container, custom marker pins, route polylines |
| **`RouteComparison.tsx`**| `src/components/RouteComparison.tsx`| 7-mode comparative grid, CO₂ savings calculations, green badges |
| **`CarbonCalculator.tsx`**| `src/components/CarbonCalculator.tsx`| Standalone distance slider and comparative emissions bar graph |
| **`EcoTracker.tsx`** | `src/components/EcoTracker.tsx` | Habit streaks, monthly budget progress, printable card |
| **`Methodology.tsx`** | `src/components/Methodology.tsx` | Cited emission factors table and scientific data links |
| **`storeService.ts`** | `src/services/storeService.ts` | Overpass API fetcher, fallback store dataset with Unsplash URLs |
| **`emissionService.ts`**| `src/services/emissionService.ts`| DESNZ / EEA emission calculation algorithms |
| **`routingService.ts`** | `src/services/routingService.ts` | OSRM road distance routing and polyline coordinate generation |
