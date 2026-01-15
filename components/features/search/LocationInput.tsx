"use client"

import * as React from "react"
import { Check, Plane, MapPin, Loader2 } from "lucide-react"
import { useDebounce } from "use-debounce"

import { cn } from "@/lib/utils"
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Location {
    code: string;
    name: string;
    city: string;
    country: string;
    type: string;
}

interface LocationInputProps {
    value: string
    onChange: (value: string) => void
    onSelect?: (location: Location) => void
    displayValue?: string
    onDisplayChange?: (display: string) => void
    placeholder?: string
    icon?: React.ReactNode
    label?: string
    className?: string
}

export function LocationInput({ value, onChange, onSelect, displayValue, onDisplayChange, placeholder, icon, label, className }: LocationInputProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [debouncedInput] = useDebounce(inputValue, 150)
    const [loading, setLoading] = React.useState(false)
    const [results, setResults] = React.useState<Location[]>([])
    const [popularAirports] = React.useState<Location[]>([
        { code: 'JFK', name: 'John F Kennedy International Airport', city: 'New York', country: 'United States', type: 'AIRPORT' },
        { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', type: 'AIRPORT' },
        { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', type: 'AIRPORT' },
        { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', type: 'AIRPORT' },
        { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', type: 'AIRPORT' },
        { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'United States', type: 'AIRPORT' },
    ])

    // Fetch results when debounced input changes
    React.useEffect(() => {
        async function fetchLocations() {
            if (!debouncedInput || debouncedInput.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const res = await fetch(`/api/locations?keyword=${encodeURIComponent(debouncedInput)}`)
                const data = await res.json()
                setResults(data.locations || [])
            } catch (error) {
                console.error("Failed to fetch locations", error)
                setResults([])
            } finally {
                setLoading(false)
            }
        }

        if (open) {
            fetchLocations()
        }
    }, [debouncedInput, open])

    const handleSelect = (location: Location) => {
        onChange(location.code)
        if (onDisplayChange) {
            onDisplayChange(`${location.city}`)
        }
        if (onSelect) {
            onSelect(location)
        }
        setOpen(false)
        setInputValue("")
    }

    return (
        <div className={cn("relative w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    className={cn(
                        "flex items-center gap-3 w-full h-16 px-5 rounded-lg border transition-all cursor-pointer text-left",
                        "hover:bg-slate-50 dark:hover:bg-slate-900",
                        value && displayValue
                            ? "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800",
                        open && "ring-2 ring-slate-400 dark:ring-slate-600"
                    )}
                >
                    <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        {value && displayValue ? (
                            <>
                                <span className="text-base font-semibold text-slate-900 dark:text-white truncate">
                                    {displayValue}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {value}
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-400 dark:text-slate-500">
                                {placeholder || "Select location"}
                            </span>
                        )}
                    </div>
                </PopoverTrigger>

                <PopoverContent className="p-0 w-[420px] shadow-xl" side="bottom" align="start" sideOffset={8}>
                    <Command shouldFilter={false} className="rounded-lg">
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Type to search..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full h-14 pl-11 pr-4 text-sm bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 outline-none placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                                autoFocus
                            />
                        </div>

                        <CommandList className="max-h-[360px] p-2">
                            {loading && (
                                <div className="py-8 flex justify-center items-center text-sm text-slate-500">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    <span>Searching...</span>
                                </div>
                            )}

                            {!loading && results.length === 0 && debouncedInput.length < 2 && (
                                <div className="space-y-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Popular Destinations
                                    </div>
                                    {popularAirports.map((loc) => (
                                        <button
                                            key={`${loc.code}-popular`}
                                            onClick={() => handleSelect(loc)}
                                            className="flex items-center gap-3 py-3 px-3 w-full hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors group"
                                        >
                                            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-900 dark:group-hover:bg-slate-700 transition-colors">
                                                <Plane className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0 text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{loc.city}</span>
                                                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">({loc.code})</span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{loc.name}</div>
                                            </div>
                                            {value === loc.code && (
                                                <Check className="w-4 h-4 text-slate-900 dark:text-slate-100 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!loading && results.length === 0 && debouncedInput.length >= 2 && (
                                <div className="py-8 text-center text-sm text-slate-500">
                                    <div className="mb-2">No results found</div>
                                    <div className="text-xs text-slate-400">Try searching for a different city or airport</div>
                                </div>
                            )}

                            {!loading && results.length > 0 && (
                                <div className="space-y-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Search Results
                                    </div>
                                    {results.map((loc) => (
                                        <button
                                            key={`${loc.code}-${loc.type}`}
                                            onClick={() => handleSelect(loc)}
                                            className="flex items-center gap-3 py-3 px-3 w-full hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors group"
                                        >
                                            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-900 dark:group-hover:bg-slate-700 transition-colors">
                                                {loc.type === 'CITY' ? 
                                                    <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors" /> : 
                                                    <Plane className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors" />
                                                }
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0 text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{loc.city}</span>
                                                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">({loc.code})</span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{loc.name}</div>
                                            </div>
                                            {value === loc.code && (
                                                <Check className="w-4 h-4 text-slate-900 dark:text-slate-100 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
