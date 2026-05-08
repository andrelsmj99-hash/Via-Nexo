import type { Report, ReportInsert } from "@/types/report";

let idCounter = 1;

export function buildReportInsert(overrides: Partial<ReportInsert> = {}): ReportInsert {
  return {
    title: "Buraco profundo na via",
    description: "Buraco de aproximadamente 30cm de diâmetro causando risco aos veículos",
    category: "pothole",
    severity: "high",
    latitude: -23.5505,
    longitude: -46.6333,
    address: "Rua das Flores, 100",
    street_name: "Rua das Flores",
    neighborhood_id: null,
    is_anonymous: false,
    ...overrides,
  };
}

export function buildReport(overrides: Partial<Report> = {}): Report {
  const id = `report-${idCounter++}`;
  return {
    id,
    user_id: "user-123",
    title: "Buraco profundo na via",
    description: "Buraco de aproximadamente 30cm de diâmetro causando risco aos veículos",
    category: "pothole",
    status: "pending",
    severity: "high",
    latitude: -23.5505,
    longitude: -46.6333,
    address: "Rua das Flores, 100",
    street_name: "Rua das Flores",
    neighborhood_id: null,
    is_anonymous: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
