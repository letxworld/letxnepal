import { ACCESS_OPTIONS, REMOTENESS_OPTIONS, VISITATION_OPTIONS } from "@/lib/destinations/repository";
import { PROVINCES } from "@/lib/nepal";
import type { DestinationFilter } from "@/lib/destinations/filter";
import { districtName } from "@/lib/destinations/repository";

/**
 * Destination filter form.
 *
 * Rendered as a real <form method="get">, so filtering works with JavaScript
 * disabled. Filter values live in the query string, which makes every filtered
 * view linkable and indexable — important for a discovery product whose traffic
 * comes from search.
 */
export function DestinationFilters({
  filter,
  resultCount,
  districts,
}: {
  filter: DestinationFilter;
  resultCount: number;
  districts: Array<{ id: string; name: string; province: string }>;
}) {
  const selectedDistricts =
    filter.province ? districts.filter((d) => d.province === filter.province) : districts;

  return (
    <form method="get" action="/destinations" className="card mb-lg p-md" role="search">
      <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="q" className="label">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            className="input"
            defaultValue={filter.q ?? ""}
            placeholder="Place, district or keyword"
          />
        </div>

        <div>
          <label htmlFor="province" className="label">
            Province
          </label>
          <select id="province" name="province" className="input" defaultValue={filter.province ?? ""}>
            <option value="">All provinces</option>
            {PROVINCES.map((province) => (
              <option key={province.id} value={province.id}>
                {province.number}. {province.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="district" className="label">
            District
          </label>
          <select id="district" name="district" className="input" defaultValue={filter.district ?? ""}>
            <option value="">All districts</option>
            {selectedDistricts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="label">
            Sort by
          </label>
          <select id="sort" name="sort" className="input" defaultValue={filter.sort}>
            <option value="name">Name</option>
            <option value="remoteness">Most remote first</option>
            <option value="visitation">Most visited first</option>
            <option value="province">Province</option>
          </select>
        </div>
      </div>

      <fieldset className="mt-md">
        <legend className="mb-xs text-sm font-medium text-foreground">Access difficulty</legend>
        <div className="flex flex-wrap gap-xs">
          {REMOTENESS_OPTIONS.map((option) => {
            const checked = filter.remoteness?.includes(option.value) ?? false;
            return (
              <label
                key={option.value}
                htmlFor={`remoteness-${option.value}`}
                className="flex min-h-[44px] cursor-pointer items-center gap-xs rounded-md border border-border bg-card px-sm text-sm"
              >
                <input
                  id={`remoteness-${option.value}`}
                  type="checkbox"
                  name="remoteness"
                  value={option.value}
                  defaultChecked={checked}
                  className="h-4 w-4"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-md">
        <legend className="mb-xs text-sm font-medium text-foreground">How known is it?</legend>
        <div className="flex flex-wrap gap-xs">
          {VISITATION_OPTIONS.map((option) => {
            const checked = filter.visitationLevel?.includes(option.value) ?? false;
            return (
              <label
                key={option.value}
                htmlFor={`visitation-${option.value}`}
                className="flex min-h-[44px] cursor-pointer items-center gap-xs rounded-md border border-border bg-card px-sm text-sm"
              >
                <input
                  id={`visitation-${option.value}`}
                  type="checkbox"
                  name="visitationLevel"
                  value={option.value}
                  defaultChecked={checked}
                  className="h-4 w-4"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-md">
        <legend className="mb-xs text-sm font-medium text-foreground">Practical</legend>
        <div className="flex flex-wrap gap-xs">
          <label
            htmlFor="hiddenGem"
            className="flex min-h-[44px] cursor-pointer items-center gap-xs rounded-md border border-border bg-card px-sm text-sm"
          >
            <input
              id="hiddenGem"
              type="checkbox"
              name="hiddenGem"
              value="true"
              defaultChecked={filter.hiddenGem === true}
              className="h-4 w-4"
            />
            Hidden gems only
          </label>
          <label
            htmlFor="bookable"
            className="flex min-h-[44px] cursor-pointer items-center gap-xs rounded-md border border-border bg-card px-sm text-sm"
          >
            <input
              id="bookable"
              type="checkbox"
              name="bookable"
              value="true"
              defaultChecked={filter.bookable === true}
              className="h-4 w-4"
            />
            Bookable stay
          </label>
          <label
            htmlFor="permitRequired"
            className="flex min-h-[44px] cursor-pointer items-center gap-xs rounded-md border border-border bg-card px-sm text-sm"
          >
            <input
              id="permitRequired"
              type="checkbox"
              name="permitRequired"
              value="true"
              defaultChecked={filter.permitRequired === true}
              className="h-4 w-4"
            />
            Permit required
          </label>
        </div>
      </fieldset>

      <div className="mt-lg flex flex-wrap items-center gap-sm">
        <button type="submit" className="btn-primary">
          Apply filters
        </button>
        <a href="/destinations" className="btn-secondary">
          Clear
        </a>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {resultCount} {resultCount === 1 ? "destination" : "destinations"}
        </p>
      </div>

      {filter.accessLevel?.length ? (
        <input type="hidden" name="accessLevel" value={filter.accessLevel.join(",")} />
      ) : null}
    </form>
  );
}

export function activeFilterBadges(filter: DestinationFilter) {
  const badges: string[] = [];
  if (filter.province) badges.push(`Province: ${PROVINCES.find((p) => p.id === filter.province)?.name ?? filter.province}`);
  if (filter.district) badges.push(`District: ${districtName(filter.district)}`);
  if (filter.hiddenGem) badges.push("Hidden gems");
  if (filter.bookable) badges.push("Bookable");
  if (filter.q) badges.push(`Search: ${filter.q}`);
  return badges;
}
