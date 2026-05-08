import type { Neighborhood, NeighborhoodSummary } from "@/types/neighborhood";

let idCounter = 1;

export function buildNeighborhood(overrides: Partial<Neighborhood> = {}): Neighborhood {
  const id = `neighborhood-${idCounter++}`;
  return {
    id,
    name: "Centro",
    city: "São Paulo",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function buildNeighborhoodSummary(overrides: Partial<NeighborhoodSummary> = {}): NeighborhoodSummary {
  const id = `neighborhood-${idCounter++}`;
  return {
    id,
    name: "Centro",
    ...overrides,
  };
}
