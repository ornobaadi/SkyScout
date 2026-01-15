import { SearchResultsPage } from "@/components/features/results/SearchResultsPage";

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
        />
    );
}
