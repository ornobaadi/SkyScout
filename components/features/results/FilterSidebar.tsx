"use client"
import { useSearchStore } from "@/store/use-search-store";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export function FilterSidebar() {
    const { filters, setFilter, resetFilters, allFlights } = useSearchStore();

    // Dynamically extract unique airlines from actual flight data
    const AIRLINES = useMemo(() => {
        const airlineMap = new Map();
        allFlights.forEach(flight => {
            if (!airlineMap.has(flight.airline.code)) {
                airlineMap.set(flight.airline.code, {
                    id: flight.airline.code,
                    label: flight.airline.name,
                    count: 1
                });
            } else {
                const airline = airlineMap.get(flight.airline.code);
                airline.count++;
            }
        });
        return Array.from(airlineMap.values()).sort((a, b) => b.count - a.count);
    }, [allFlights]);

    // Calculate price range from actual data
    const priceRange = useMemo(() => {
        if (allFlights.length === 0) return { min: 0, max: 3000 };
        const prices = allFlights.map(f => f.price);
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
        };
    }, [allFlights]);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 sticky top-20">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Filters</h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters} 
                    className="text-indigo-600 hover:text-indigo-700 h-auto p-1 hover:bg-indigo-50 rounded-md font-medium text-sm"
                >
                    Reset
                </Button>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-700">
                {allFlights.length} flights found
            </div>

            {/* Price */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">Max Price</Label>
                    <span className="text-lg font-bold text-indigo-600">${filters.maxPrice}</span>
                </div>
                <Slider
                    value={[filters.maxPrice]}
                    min={priceRange.min}
                    max={priceRange.max}
                    step={10}
                    onValueChange={(val) => setFilter('maxPrice', val[0])}
                    className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500">
                    <span>${priceRange.min}</span>
                    <span>${priceRange.max}</span>
                </div>
            </div>

            {/* Stops */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">Stops</Label>
                <div className="space-y-3">
                    {[
                        { val: 0, label: "Direct", badge: "Fastest" },
                        { val: 1, label: "1 Stop", badge: null },
                        { val: 2, label: "2+ Stops", badge: "Cheapest" }
                    ].map((opt) => (
                        <div key={opt.val} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id={`stop-${opt.val}`}
                                    checked={filters.stops === null || filters.stops.includes(opt.val)}
                                    onCheckedChange={(checked) => {
                                        const current = filters.stops || [0, 1, 2];
                                        let next;
                                        if (checked) {
                                            next = [...current, opt.val];
                                        } else {
                                            next = current.filter(s => s !== opt.val);
                                        }
                                        setFilter('stops', next.length === 3 ? null : next);
                                    }}
                                />
                                <Label htmlFor={`stop-${opt.val}`} className="font-normal cursor-pointer">{opt.label}</Label>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-slate-600">
                                {allFlights.filter(f => opt.val === 2 ? f.stops >= 2 : f.stops === opt.val).length}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Airlines */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">Airlines</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 -mr-2">
                    {AIRLINES.length === 0 ? (
                        <div className="text-sm text-slate-400 py-2">No airlines available</div>
                    ) : (
                        AIRLINES.map((airline) => (
                            <div key={airline.id} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <Checkbox
                                        id={`al-${airline.id}`}
                                        checked={filters.airlines.length === 0 || filters.airlines.includes(airline.id)}
                                        onCheckedChange={(checked) => {
                                            const current = filters.airlines;
                                            let next;
                                            if (current.includes(airline.id)) {
                                                next = current.filter(id => id !== airline.id)
                                            } else {
                                                next = [...current, airline.id]
                                            }
                                            setFilter('airlines', next);
                                        }}
                                    />
                                    <Label htmlFor={`al-${airline.id}`} className="font-normal cursor-pointer truncate flex-1">{airline.label}</Label>
                                </div>
                                <span className="text-xs text-slate-400 group-hover:text-slate-600 shrink-0">
                                    {airline.count}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
