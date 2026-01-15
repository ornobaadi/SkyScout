import { create } from 'zustand';
import { Flight, SearchParams, FilterState } from '@/lib/api/types';
import { MOCK_FLIGHTS } from '@/lib/api/mock-data';

interface SearchStore {
    // Search State
    searchParams: SearchParams;
    setSearchParams: (params: Partial<SearchParams>) => void;

    // Data State
    allFlights: Flight[];
    filteredFlights: Flight[];
    isLoading: boolean;
    error: string | null;

    // Filter State
    filters: FilterState;
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    resetFilters: () => void;

    // Actions
    searchFlights: () => Promise<void>;
    applyFilters: () => void;
}

const INITIAL_FILTERS: FilterState = {
    maxPrice: 2000, // Safe upper limit
    stops: null,
    airlines: [],
    timeRange: 'all',
};

export const useSearchStore = create<SearchStore>((set, get) => ({
    searchParams: {
        origin: '',
        destination: '',
        departureDate: undefined,
        returnDate: undefined,
        passengers: 1,
    },

    allFlights: [],
    filteredFlights: [],
    isLoading: false,
    error: null,

    filters: INITIAL_FILTERS,

    setSearchParams: (params) => {
        set((state) => ({
            searchParams: { ...state.searchParams, ...params },
        }));
    },

    setFilter: (key, value) => {
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        }));
        get().applyFilters();
    },

    resetFilters: () => {
        set({ filters: INITIAL_FILTERS });
        get().applyFilters();
    },

    searchFlights: async () => {
        set({ isLoading: true, error: null });
        const { origin, destination, departureDate } = get().searchParams;

        if (!origin || !destination || !departureDate) {
            set({ isLoading: false, error: 'Please select origin, destination and date.' });
            return;
        }

        try {
            const params = new URLSearchParams({
                origin,
                destination,
                date: departureDate instanceof Date ? departureDate.toISOString() : departureDate
            });

            const res = await fetch(`/api/flights?${params.toString()}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch flights');
            }

            const data = await res.json();
            const flights: Flight[] = data.flights;

            if (flights.length === 0) {
                set({ allFlights: [], filteredFlights: [], isLoading: false, error: null }); // No error, just empty
                return;
            }

            // Calculate dynamic max price from results
            const maxPriceInResults = Math.max(...flights.map(f => f.price));

            set({
                allFlights: flights,
                filteredFlights: flights,
                filters: {
                    ...get().filters,
                    maxPrice: Math.ceil(maxPriceInResults) + 20
                },
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch flights', isLoading: false });
        }
    },

    applyFilters: () => {
        const { allFlights, filters } = get();

        const filtered = allFlights.filter((flight) => {
            // Price Filter
            if (flight.price > filters.maxPrice) return false;

            // Stops Filter
            if (filters.stops && filters.stops.length > 0) {
                if (!filters.stops.includes(flight.stops)) return false;
            }

            // Airlines Filter
            if (filters.airlines.length > 0) {
                if (!filters.airlines.includes(flight.airline.code)) return false;
            }

            // Time Range Filter (Bonus)
            if (filters.timeRange !== 'all') {
                const hour = new Date(flight.departure.at).getHours();
                if (filters.timeRange === 'morning' && (hour < 5 || hour >= 12)) return false;
                if (filters.timeRange === 'afternoon' && (hour < 12 || hour >= 18)) return false;
                if (filters.timeRange === 'evening' && (hour < 18)) return false;
            }

            return true;
        });

        set({ filteredFlights: filtered });
    },
}));
