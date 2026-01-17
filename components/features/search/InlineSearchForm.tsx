"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { 
    Calendar as CalendarIcon, 
    Search, 
    ArrowRightLeft, 
    Users, 
    PlaneTakeoff, 
    PlaneLanding,
    ChevronDown,
    Sparkles,
    X,
    Armchair,
    CircleDot,
    Briefcase,
    Crown
} from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useSearchStore } from "@/store/use-search-store"
import { LocationInput } from "./LocationInput"
import { Skeleton } from "@/components/ui/skeleton"
import type { CabinClass } from "@/lib/api/types"

interface InlineSearchFormProps {
    defaultExpanded?: boolean
    onSearchStart?: () => void
}

export function InlineSearchForm({ defaultExpanded = false, onSearchStart }: InlineSearchFormProps) {
    const router = useRouter()
    const currentSearchParams = useSearchParams()
    const { searchParams, setSearchParams, searchFlights, isLoading } = useSearchStore()

    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
    
    // Local form state
    const [origin, setOrigin] = React.useState(searchParams.origin || "")
    const [originDisplay, setOriginDisplay] = React.useState(searchParams.origin || "")
    const [destination, setDestination] = React.useState(searchParams.destination || "")
    const [destinationDisplay, setDestinationDisplay] = React.useState(searchParams.destination || "")
    const [date, setDate] = React.useState<Date | undefined>(searchParams.departureDate)
    const [returnDate, setReturnDate] = React.useState<Date | undefined>(searchParams.returnDate)
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
        searchParams.departureDate 
            ? { from: searchParams.departureDate, to: searchParams.returnDate } 
            : undefined
    )
    const [passengers, setPassengers] = React.useState(searchParams.passengers)
    const [tripType, setTripType] = React.useState<"one-way" | "round-trip">(
        searchParams.returnDate ? "round-trip" : "one-way"
    )
    const [cabin, setCabin] = React.useState<CabinClass>(searchParams.cabinClass)

    // Sync from URL params on mount
    React.useEffect(() => {
        const urlOrigin = currentSearchParams.get("origin")
        const urlDestination = currentSearchParams.get("destination")
        const urlDate = currentSearchParams.get("date")
        const urlReturnDate = currentSearchParams.get("returnDate")
        const urlPassengers = currentSearchParams.get("passengers")
        const urlCabin = currentSearchParams.get("cabinClass") as CabinClass | null

        if (urlOrigin) {
            setOrigin(urlOrigin)
            setOriginDisplay(urlOrigin)
        }
        if (urlDestination) {
            setDestination(urlDestination)
            setDestinationDisplay(urlDestination)
        }
        if (urlDate) {
            const parsedDate = new Date(urlDate)
            setDate(parsedDate)
            if (urlReturnDate) {
                const parsedReturn = new Date(urlReturnDate)
                setReturnDate(parsedReturn)
                setDateRange({ from: parsedDate, to: parsedReturn })
                setTripType("round-trip")
            } else {
                setDateRange({ from: parsedDate, to: undefined })
            }
        }
        if (urlPassengers) {
            setPassengers(Number(urlPassengers))
        }
        if (urlCabin) {
            setCabin(urlCabin)
        }
    }, [currentSearchParams])

    // Sync date range
    React.useEffect(() => {
        if (tripType === "round-trip" && dateRange) {
            setDate(dateRange.from)
            setReturnDate(dateRange.to)
        }
    }, [dateRange, tripType])

    const handleSearch = React.useCallback(() => {
        if (!origin || !destination || !date) return

        onSearchStart?.()

        setSearchParams({
            origin,
            destination,
            departureDate: date,
            returnDate: tripType === "round-trip" ? returnDate : undefined,
            passengers,
            cabinClass: cabin
        })

        // Update URL
        const params = new URLSearchParams()
        params.set("origin", origin)
        params.set("destination", destination)
        params.set("date", date.toISOString())
        if (tripType === "round-trip" && returnDate) {
            params.set("returnDate", returnDate.toISOString())
        }
        params.set("passengers", String(passengers))
        params.set("cabinClass", cabin)

        // Update URL without full navigation
        router.replace(`/search?${params.toString()}`, { scroll: false })
        
        // Trigger search
        searchFlights()
        
        // Collapse form after search
        setIsExpanded(false)
    }, [origin, destination, date, returnDate, tripType, passengers, cabin, onSearchStart, setSearchParams, router, searchFlights])

    const handleSwap = () => {
        const tempCode = origin
        const tempDisplay = originDisplay
        setOrigin(destination)
        setOriginDisplay(destinationDisplay)
        setDestination(tempCode)
        setDestinationDisplay(tempDisplay)
    }

    const isValid = origin && destination && date && (tripType === "one-way" || returnDate)

    // Render collapsed state
    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-200 group"
            >
                <div className="flex items-center gap-6 flex-wrap">
                    {/* Route */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                            <PlaneTakeoff className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{origin || "Origin"}</span>
                        <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                            <PlaneLanding className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{destination || "Destination"}</span>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                    {/* Date */}
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                            {date ? format(date, "MMM d") : "Select date"}
                            {tripType === "round-trip" && returnDate && (
                                <> – {format(returnDate, "MMM d")}</>
                            )}
                        </span>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                    {/* Passengers & Cabin */}
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                            {passengers} traveler{passengers !== 1 ? "s" : ""}, {cabin}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">
                        Modify search
                    </span>
                    <ChevronDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
            </button>
        )
    }

    // Render expanded state
    return (
        <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {/* Header with collapse button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Modify Your Search</h3>
                </div>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Trip Type Toggle */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg w-fit">
                    <button
                        onClick={() => setTripType("round-trip")}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            tripType === "round-trip"
                                ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        Round Trip
                    </button>
                    <button
                        onClick={() => {
                            setTripType("one-way")
                            setReturnDate(undefined)
                            setDateRange(date ? { from: date, to: undefined } : undefined)
                        }}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            tripType === "one-way"
                                ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        One Way
                    </button>
                </div>

                {/* Route Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    {/* Origin */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <PlaneTakeoff className="w-3.5 h-3.5" />
                            FROM
                        </label>
                        <LocationInput
                            value={origin}
                            displayValue={originDisplay}
                            onChange={setOrigin}
                            onDisplayChange={setOriginDisplay}
                            placeholder="City or airport"
                            label=""
                            icon={null}
                        />
                    </div>

                    {/* Swap Button */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-1 z-20 hidden md:flex">
                        <button
                            onClick={handleSwap}
                            className="group p-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <ArrowRightLeft className="w-4 h-4 text-white dark:text-slate-900 group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Destination */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <PlaneLanding className="w-3.5 h-3.5" />
                            TO
                        </label>
                        <LocationInput
                            value={destination}
                            displayValue={destinationDisplay}
                            onChange={setDestination}
                            onDisplayChange={setDestinationDisplay}
                            placeholder="City or airport"
                            label=""
                            icon={null}
                        />
                    </div>
                </div>

                {/* Date, Passengers, Cabin - Compact Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Picker */}
                    <div className="sm:col-span-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {tripType === "round-trip" ? "DATES" : "DATE"}
                        </label>
                        <Popover>
                            <PopoverTrigger
                                className={cn(
                                    "w-full h-12 px-4 rounded-lg border transition-all duration-200 text-left hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between",
                                    date
                                        ? "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <span className={cn(
                                    "text-sm",
                                    date ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"
                                )}>
                                    {tripType === "round-trip" ? (
                                        dateRange?.from ? (
                                            dateRange.to ? (
                                                `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
                                            ) : (
                                                format(dateRange.from, "MMM d, yyyy")
                                            )
                                        ) : (
                                            "Select dates"
                                        )
                                    ) : (
                                        date ? format(date, "MMM d, yyyy") : "Select date"
                                    )}
                                </span>
                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                {tripType === "round-trip" ? (
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            setDateRange(range)
                                            if (range?.from) setDate(range.from)
                                            if (range?.to) setReturnDate(range.to)
                                        }}
                                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                        numberOfMonths={2}
                                        className="p-3"
                                    />
                                ) : (
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                        className="p-3"
                                    />
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Passengers */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            <Users className="w-3.5 h-3.5" />
                            TRAVELERS
                        </label>
                        <Popover>
                            <PopoverTrigger className="w-full h-12 px-4 rounded-lg bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                                </span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-4" align="start">
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select passengers</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3, 4, 5, 6].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setPassengers(num)}
                                                className={cn(
                                                    "py-2.5 rounded-md text-sm font-medium transition-colors border",
                                                    passengers === num
                                                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                                                        : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                                                )}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Cabin Class */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            CLASS
                        </label>
                        <Popover>
                            <PopoverTrigger className="w-full h-12 px-4 rounded-lg bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{cabin}</span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3" align="start">
                                <div className="space-y-2">
                                    {[
                                        { value: "Economy" as CabinClass, icon: Armchair, desc: "Best value" },
                                        { value: "Premium Economy" as CabinClass, icon: CircleDot, desc: "Extra comfort" },
                                        { value: "Business" as CabinClass, icon: Briefcase, desc: "Premium service" },
                                        { value: "First" as CabinClass, icon: Crown, desc: "Ultimate luxury" }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setCabin(option.value)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors border",
                                                cabin === option.value
                                                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                                                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                                            )}
                                        >
                                            <option.icon className={cn(
                                                "w-5 h-5",
                                                cabin === option.value ? "text-white dark:text-slate-900" : "text-slate-600 dark:text-slate-400"
                                            )} />
                                            <div className="flex-1">
                                                <div className={cn(
                                                    "font-medium text-sm",
                                                    cabin === option.value ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-white"
                                                )}>{option.value}</div>
                                                <div className={cn(
                                                    "text-xs",
                                                    cabin === option.value ? "text-slate-300 dark:text-slate-600" : "text-slate-500"
                                                )}>
                                                    {option.desc}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Search Button */}
                <Button
                    onClick={handleSearch}
                    disabled={!isValid || isLoading}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Searching...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            <span>Search Flights</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    )
}

// Skeleton loader for the inline search form
export function InlineSearchFormSkeleton() {
    return (
        <div className="w-full px-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-6 w-px hidden sm:block" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-px hidden sm:block" />
                    <Skeleton className="h-5 w-40" />
                </div>
                <Skeleton className="h-5 w-24" />
            </div>
        </div>
    )
}
