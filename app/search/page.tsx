import { SearchResultsPage } from "@/components/features/results/SearchResultsPage";
import type { CabinClass } from "@/lib/api/types";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;

    return (
        <SearchResultsPage
            initialOrigin={params.origin as string}
            initialDestination={params.destination as string}
            initialDate={params.date as string}
            initialPassengers={params.passengers ? Number(params.passengers) : undefined}
            initialCabinClass={params.cabinClass as CabinClass | undefined}
        />
    );
}
