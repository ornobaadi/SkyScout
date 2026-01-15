"use client"

import { Flight } from "@/lib/api/types";
import { format, differenceInMinutes } from "date-fns";
import { ChevronDown, Plane, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Image from "next/image";

export function FlightCard({ flight }: { flight: Flight }) {
    const [expanded, setExpanded] = useState(false);

    // Duration formatter
    const hours = Math.floor(flight.duration / 60);
    const minutes = flight.duration % 60;
    const durationString = `${hours}h ${minutes}m`;

    // Calculate if next day arrival
    const depDate = new Date(flight.departure.at);
    const arrDate = new Date(flight.arrival.at);
    const isNextDay = depDate.getDate() !== arrDate.getDate();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 hover:shadow-lg transition-all overflow-hidden">
            <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                {/* Airline Info */}
                <div className="flex items-center gap-4 min-w-[180px]">
                    <div className="relative w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                        <Image
                            src={flight.airline.logo}
                            alt={flight.airline.name}
                            width={40}
                            height={40}
                            className="object-contain"
                            onError={(e) => {
                                // Fallback to text
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {flight.airline.code}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">{flight.airline.name}</span>
                        <span className="text-xs text-slate-500">{flight.flightNumber}</span>
                    </div>
                </div>

                {/* Itinerary */}
                <div className="flex-1 flex items-center justify-between md:gap-8 w-full">
                    {/* Departure */}
                    <div className="text-left flex-shrink-0">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                            {format(depDate, 'HH:mm')}
                        </div>
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                            {flight.departure.airport.code}
                        </div>
                        <div className="text-xs text-slate-400">
                            {format(depDate, 'MMM d')}
                        </div>
                    </div>

                    {/* Journey Line */}
                    <div className="flex flex-col items-center px-4 flex-1 max-w-xs">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-medium text-slate-600">{durationString}</span>
                        </div>
                        <div className="w-full relative flex items-center">
                            <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600" />
                            {flight.stops > 0 && (
                                <div className="absolute left-1/2 -translate-x-1/2 -top-1.5">
                                    <div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
                                </div>
                            )}
                            <Plane className="w-4 h-4 text-indigo-500 rotate-90 absolute left-1/2 -translate-x-1/2" />
                        </div>
                        <div className="mt-2">
                            {flight.stops === 0 ? (
                                <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
                                    Direct
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-xs">
                                    {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                            {format(arrDate, 'HH:mm')}
                        </div>
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                            {flight.arrival.airport.code}
                        </div>
                        <div className="text-xs text-slate-400">
                            {format(arrDate, 'MMM d')}
                            {isNextDay && <span className="text-orange-500 ml-1">+1</span>}
                        </div>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 justify-between md:min-w-[160px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0 w-full md:w-auto">
                    <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total</div>
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            ${flight.price.toFixed(0)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{flight.currency}</div>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <Button className="w-full md:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all">
                            Select Flight
                        </Button>
                        {flight.stops > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-slate-600 hover:text-indigo-600"
                                onClick={() => setExpanded(!expanded)}
                            >
                                <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                {expanded ? 'Hide' : 'Show'} details
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Segment Details */}
            {expanded && flight.segments && flight.segments.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Flight Details
                    </h4>
                    <div className="space-y-4">
                        {flight.segments.map((segment, idx) => (
                            <div key={segment.id} className="relative">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        {idx < flight.segments.length - 1 && (
                                            <div className="w-px h-16 bg-slate-300 dark:bg-slate-600 my-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {segment.departure.airport.code} → {segment.arrival.airport.code}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {segment.airline.name} {segment.flightNumber}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-slate-500 text-xs mb-1">Depart</div>
                                                <div className="font-medium">{format(new Date(segment.departure.at), 'HH:mm, MMM d')}</div>
                                                <div className="text-xs text-slate-500">{segment.departure.airport.name || segment.departure.airport.code}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 text-xs mb-1">Arrive</div>
                                                <div className="font-medium">{format(new Date(segment.arrival.at), 'HH:mm, MMM d')}</div>
                                                <div className="text-xs text-slate-500">{segment.arrival.airport.name || segment.arrival.airport.code}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-slate-500">
                                            Duration: {Math.floor(segment.duration / 60)}h {segment.duration % 60}m
                                        </div>
                                    </div>
                                </div>
                                {idx < flight.segments.length - 1 && (
                                    <div className="ml-12 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <div className="text-xs font-medium text-amber-800 dark:text-amber-200">
                                            ⏱ Layover: {Math.floor(differenceInMinutes(new Date(flight.segments[idx + 1].departure.at), new Date(segment.arrival.at)) / 60)}h {differenceInMinutes(new Date(flight.segments[idx + 1].departure.at), new Date(segment.arrival.at)) % 60}m
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
