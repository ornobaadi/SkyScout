import { Flight, CabinClass } from "./types";

export const CABIN_MULTIPLIERS: Record<CabinClass, number> = {
    "Economy": 1,
    "Premium Economy": 1.35,
    "Business": 1.9,
    "First": 2.6,
};

export function getCabinMultiplier(cabin: CabinClass) {
    return CABIN_MULTIPLIERS[cabin] ?? 1;
}

export function getPriceForSearch(
    flight: Flight,
    passengers: number,
    cabinClass: CabinClass
) {
    const multiplier = getCabinMultiplier(cabinClass);
    return flight.price * Math.max(passengers, 1) * multiplier;
}
