# SkyScout - Flight Search Engine

SkyScout is a modern, responsive flight search application built with Next.js 15, TypeScript, Tailwind CSS, and Zustand. It features real-time price trend visualization and instant filtering.

## Features

- **Real-time Search**: Search by Origin, Destination, and Date.
- **Instant Filtering**: Filter by Price, Stops, and Airlines with immediate UI updates.
- **Live Price Graph**: An interactive area chart that visualizes price trends based on the current filtered results.
- **Responsive Design**: Fully responsive layout with mobile-optimized views.
- **Premium UI**: Polished aesthetics with smooth animations and skeleton loading states.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Visualization**: Recharts
- **Icons**: Lucide React
- **Dates**: date-fns

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/features/`: Feature-specific components (Search, Results).
- `components/ui/`: Reusable UI primitives (Shadcn-compatible).
- `lib/api/`: Mock data and type definitions.
- `store/`: Zustand global state store.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000).

## Known Issues

- Minor hydration warning on the landing page regarding button nesting, does not affect functionality.
- Mock data is currently used for reliability; Amadeus API integration would follow the `FlightService` interface pattern in `lib/api`.

## License

MIT
