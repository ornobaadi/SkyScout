"use client"
import { useSearchStore } from "@/store/use-search-store";
import { Skeleton } from "@/components/ui/skeleton";
import { FlightCard } from "./FlightCard";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Clock, DollarSign, Plane } from "lucide-react";
import { useState, useMemo } from "react";

type SortOption = 'price' | 'duration' | 'departure' | 'stops';

export function FlightList() {
    const { filteredFlights, isLoading, error } = useSearchStore();
    const [sortBy, setSortBy] = useState<SortOption>('price');

    // Sort flights
    const sortedFlights = useMemo(() => {
        const flights = [...filteredFlights];
        switch (sortBy) {
            case 'price':
                return flights.sort((a, b) => a.price - b.price);
            case 'duration':
                return flights.sort((a, b) => a.duration - b.duration);
            case 'departure':
                return flights.sort((a, b) => new Date(a.departure.at).getTime() - new Date(b.departure.at).getTime());
            case 'stops':
                return flights.sort((a, b) => a.stops - b.stops);
            default:
                return flights;
        }
    }, [filteredFlights, sortBy]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <div className="flex items-center gap-12">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                            <Skeleton className="h-10 w-32 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-16 px-8 bg-red-50 dark:bg-red-900/10 rounded-xl border-2 border-red-100 dark:border-red-900">
                <div className="text-5xl mb-4">✈️</div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">Oops! Something went wrong</h3>
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
        )
    }

    if (sortedFlights.length === 0) {
        return (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No flights found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or search criteria</p>
                <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
                    <Plane className="w-4 h-4" />
                    New Search
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="font-medium">Sort by:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={sortBy === 'price' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('price')}
                        className={sortBy === 'price' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Price
                    </Button>
                    <Button
                        variant={sortBy === 'duration' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('duration')}
                        className={sortBy === 'duration' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                        <Clock className="w-4 h-4 mr-1" />
                        Duration
                    </Button>
                    <Button
                        variant={sortBy === 'departure' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('departure')}
                        className={sortBy === 'departure' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                        <Plane className="w-4 h-4 mr-1" />
                        Departure
                    </Button>
                    <Button
                        variant={sortBy === 'stops' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('stops')}
                        className={sortBy === 'stops' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                        Direct First
                    </Button>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white">{sortedFlights.length}</strong> flights
                </div>
            </div>

            {/* Flight Cards */}
            <div className="space-y-4">
                {sortedFlights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} />
                ))}
            </div>
        </div>
    )
}
