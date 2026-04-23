export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  created_at: string;
}

export interface NeighborhoodInsert {
  name: string;
  city: string;
}

export interface NeighborhoodSummary {
  id: string;
  name: string;
}
