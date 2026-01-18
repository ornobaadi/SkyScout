"use client"

import Link from "next/link";
import { Plane, ArrowRightLeft, CalendarIcon, Users, ChevronDown, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchHeaderProps {
    showSearch?: boolean;
    onModifyClick?: () => void;
    isSearchExpanded?: boolean;
}

export function SearchHeader({ showSearch = false, onModifyClick, isSearchExpanded = false }: SearchHeaderProps) {
    const searchParams = useSearchParams();
    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const dateStr = searchParams.get("date");
    const passengers = searchParams.get("passengers") || "1";
    const cabinClass = searchParams.get("cabinClass") || "Economy";

    let formattedDate = "";
    if (dateStr) {
        try {
            formattedDate = format(new Date(dateStr), "MMM d");
        } catch (e) {
            formattedDate = "";
        }
    }

    const hasSearchData = origin && destination;

    return (
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-30">
            <div className="container mx-auto max-w-7xl px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                    <span className="font-bold text-lg sm:text-xl text-indigo-900 dark:text-indigo-100 font-display hidden sm:block">SkyScout</span>
                </Link>

                {/* Compact Search Summary - Only show when we have search data */}
                {showSearch && hasSearchData && (
                    <button
                        onClick={onModifyClick}
                        className={cn(
                            "flex-1 max-w-2xl flex items-center justify-between gap-2 px-3 py-2 rounded-full border transition-all duration-200 group",
                            isSearchExpanded 
                                ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700"
                                : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
                        )}
                    >
                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                            {/* Route - Compact */}
                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{origin}</span>
                                <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                                <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{destination}</span>
                            </div>

                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block" />

                            {/* Date */}
                            {formattedDate && (
                                <div className="hidden sm:flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs text-slate-600 dark:text-slate-300">{formattedDate}</span>
                                </div>
                            )}

                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 hidden md:block" />

                            {/* Passengers & Cabin - Hidden on mobile */}
                            <div className="hidden md:flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-600 dark:text-slate-300">
                                    {passengers} · {cabinClass}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-indigo-600 dark:text-indigo-400">
                            {isSearchExpanded ? (
                                <X className="w-4 h-4" />
                            ) : (
                                <>
                                    <span className="text-xs font-medium hidden sm:block">Modify</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </>
                            )}
                        </div>
                    </button>
                )}

                {/* Right side actions */}
                <div className="flex gap-1 sm:gap-2 items-center shrink-0">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
