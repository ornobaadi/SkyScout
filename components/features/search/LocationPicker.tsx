import * as React from "react"
import { useDebounce } from "use-debounce"
import { Loader2 } from "lucide-react"

import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxTrigger,
    ComboboxValue
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

interface Location {
    code: string;
    name: string;
    city: string;
    country: string;
}

interface LocationPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function LocationPicker({ label, value, onChange, placeholder }: LocationPickerProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [debouncedInput] = useDebounce(inputValue, 400) // Increase debounce to 400ms to allow typing
    const [results, setResults] = React.useState<Location[]>([])
    const [loading, setLoading] = React.useState(false)

    // Sync internal input only when dialog opens? Or always?
    // Problem: value is 'JFK', but input should be 'New York' if we want easy editing?
    // For now: Input is independent of Value until selected.

    // Fetch when debounced input changes
    React.useEffect(() => {
        async function search() {
            if (!debouncedInput || debouncedInput.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const res = await fetch(`/api/locations?keyword=${encodeURIComponent(debouncedInput)}`)
                const data = await res.json()
                setResults(data.locations || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        // Only search if open or just opened to avoid spamming while just viewing
        if (open) {
            search()
        }
    }, [debouncedInput, open])

    // Get display label from value if not searching
    // Ideally we'd store the full object, but store uses string code.
    // We can try to look it up from results or just show code.
    // Actually, ComboboxValue handles showing the 'label' of the selected item if passed properly context,
    // but here we are async.

    return (
        <div className="md:col-span-3 space-y-2">
            <Label>{label}</Label>
            <Combobox
                open={open}
                onOpenChange={setOpen}
                value={value || null}
                onValueChange={(val) => {
                    onChange(String(val))
                    setOpen(false) // Close on select
                }}
            >
                <ComboboxTrigger className="w-full h-10 px-3 py-2 border rounded-md flex items-center justify-between text-sm bg-white cursor-text hover:bg-slate-50">
                    <ComboboxValue>
                        {value ? value : placeholder}
                    </ComboboxValue>
                </ComboboxTrigger>

                {/* FIX: Add min-width to ensure it's not squashed */}
                <ComboboxContent className="w-[300px] sm:w-[350px] p-0 overflow-hidden">
                    <ComboboxInput
                        placeholder="Type city or airport..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="border-0 focus:ring-0 px-3 py-2"
                    />
                    <ComboboxList className="max-h-[300px] overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center p-4 text-slate-500">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Searching...
                            </div>
                        )}

                        {!loading && results.length === 0 && debouncedInput.length >= 2 && (
                            <ComboboxEmpty className="py-2 text-center text-sm text-slate-500">No results found.</ComboboxEmpty>
                        )}

                        {!loading && results.length === 0 && debouncedInput.length < 2 && (
                            <div className="py-2 text-center text-sm text-slate-400">Type at least 2 characters</div>
                        )}

                        {!loading && results.map((loc, idx) => (
                            <ComboboxItem key={`${loc.code}-${idx}`} value={loc.code} className="px-4 py-2 cursor-pointer hover:bg-slate-50">
                                <div className="flex flex-col items-start gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">{loc.city}</span>
                                        <span className="text-xs bg-slate-100 px-1.5 rounded text-slate-600 font-medium border">{loc.code}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">{loc.name}</span>
                                </div>
                            </ComboboxItem>
                        ))}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    )
}
