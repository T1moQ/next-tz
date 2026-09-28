import { readMenuFilters } from "@/features/stop-list/model/filters";
import { Filters } from "@/features/stop-list/ui/Filters";

export default async function Home({ searchParams }: PageProps<"/">) {
  const filters = readMenuFilters(await searchParams);

  return (
    <main className="flex-1 bg-[#F6F3EE] px-4 py-10 text-[#171512] sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Стоп-лист</h1>
          <p className="mt-2 text-sm text-[#171512]/60">
            Управляйте доступностью позиций меню
          </p>
        </header>
        <Filters filters={filters} />
      </div>
    </main>
  );
}
