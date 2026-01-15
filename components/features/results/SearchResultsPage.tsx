"use client"

import { useEffect } from "react"
import { useSearchStore } from "@/store/use-search-store"
import { FilterSidebar } from "./FilterSidebar"
import { PriceChart } from "./PriceChart"
import { FlightList } from "./FlightList"
import { SearchHeader } from "@/components/layout/SearchHeader"

export function SearchResultsPage({
    initialOrigin,
    initialDestination,
    initialDate
}: {
    initialOrigin?: string,
    initialDestination?: string,
    initialDate?: string
}) {
    const setSearchParams = useSearchStore((state) => state.setSearchParams)
    const searchFlights = useSearchStore((state) => state.searchFlights)

    useEffect(() => {
        // Initialize store with URL params
        setSearchParams({
            origin: initialOrigin || '',
            destination: initialDestination || '',
            departureDate: initialDate ? new Date(initialDate) : undefined,
        })

        // Trigger initial search
        searchFlights()
    }, [initialOrigin, initialDestination, initialDate, setSearchParams, searchFlights])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:bg-slate-950 pb-20">
            <SearchHeader />

            <main className="container mx-auto max-w-7xl px-4 py-6 flex flex-col lg:flex-row gap-6">

                {/* Filters Sidebar */}
                <aside className="hidden lg:block lg:w-80 flex-shrink-0">
                    <FilterSidebar />
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-6">

                    {/* Price Chart Section */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 h-80 relative overflow-hidden transition-all hover:shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Price History</h2>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Lowest fares by time</span>
                        </div>
                        <div className="h-full pb-4">
                            <PriceChart />
                        </div>
                    </section>

                    {/* Flight List Section */}
                    <section>
                        <FlightList />
                    </section>
                </div>
            </main>
        </div>
    )
}
