"use client"
import { useSearchStore } from "@/store/use-search-store";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from "date-fns";
import { TrendingDown } from "lucide-react";

export function PriceChart() {
    const { filteredFlights } = useSearchStore();

    // Prepare data - group by time slots for better visualization
    const data = [...filteredFlights]
        .sort((a, b) => new Date(a.departure.at).getTime() - new Date(b.departure.at).getTime())
        .map(flight => ({
            time: format(new Date(flight.departure.at), 'HH:mm'),
            price: flight.price,
            airline: flight.airline.name,
            stops: flight.stops,
            fullDate: flight.departure.at
        }));

    const minPrice = data.length > 0 ? Math.min(...data.map(d => d.price)) : 0;
    const maxPrice = data.length > 0 ? Math.max(...data.map(d => d.price)) : 0;

    if (data.length === 0) return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm">No data to visualize</p>
        </div>
    );

    return (
        <div className="w-full h-full pt-2 pr-4 relative">
            {/* Stats Badge */}
            <div className="absolute top-2 left-4 z-10 flex gap-3">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg shadow-sm">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Lowest Price</div>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" />
                        ${minPrice.toFixed(0)}
                    </div>
                </div>
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg shadow-sm">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Avg Price</div>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        ${Math.round(data.reduce((sum, d) => sum + d.price, 0) / data.length)}
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 70,
                        right: 10,
                        left: 10,
                        bottom: 10,
                    }}
                >
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 11, fill: '#94a3b8' }} 
                        stroke="#cbd5e1"
                        tickLine={false}
                    />
                    <YAxis 
                        orientation="right" 
                        tick={{ fontSize: 12, fill: '#94a3b8' }} 
                        tickFormatter={(val) => `$${val}`} 
                        stroke="#cbd5e1"
                        tickLine={false}
                        domain={['dataMin - 50', 'dataMax + 50']}
                    />
                    <Tooltip
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                        }}
                        formatter={(val: number | undefined, name: string | undefined, props: any) => [
                            `$${val?.toFixed(0) ?? '0'}`,
                            `${props.payload.airline} • ${props.payload.stops === 0 ? 'Direct' : `${props.payload.stops} stop${props.payload.stops > 1 ? 's' : ''}`}`
                        ]}
                        labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
                    />
                    {/* Min price reference line */}
                    <ReferenceLine 
                        y={minPrice} 
                        stroke="#10b981" 
                        strokeDasharray="3 3" 
                        strokeWidth={2}
                        label={{ 
                            value: `Best: $${minPrice.toFixed(0)}`, 
                            position: 'left', 
                            fill: '#10b981',
                            fontSize: 11,
                            fontWeight: 600
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        animationDuration={800}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
