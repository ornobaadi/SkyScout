"use client"

import { useEffect, useState } from "react"
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
    const filteredFlights = useSearchStore((state) => state.filteredFlights)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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

    if (!mounted) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-blue-50/30 dark:from-slate-950 dark:to-slate-900">
            <SearchHeader />

            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-100/30 blur-3xl" />
                <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-blue-100/20 blur-3xl" />
            </div>

            <main className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-3">
                        <FilterSidebar />
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-9 space-y-6">

                        {/* Results Summary */}
                        {filteredFlights.length > 0 && (
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {filteredFlights.length} {filteredFlights.length === 1 ? 'Flight' : 'Flights'} Found
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {initialOrigin} → {initialDestination}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Price Chart Section */}
                        <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Price Overview</h2>
                                <span className="text-xs text-slate-500 dark:text-slate-400">By departure time</span>
                            </div>
                            <div className="h-72">
                                <PriceChart />
                            </div>
                        </section>

                        {/* Flight List Section */}
                        <section>
                            <FlightList />
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
