import type { ReportConfirmation } from "@/types/report";

let idCounter = 1;

export function buildConfirmation(overrides: Partial<ReportConfirmation> = {}): ReportConfirmation {
  const id = `confirmation-${idCounter++}`;
  return {
    id,
    report_id: "report-1",
    user_id: "user-1",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
