import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/supabase";
import { mockState, mockEq, mockNeq } from "@/tests/mocks/supabase";
import { buildReport } from "@/tests/factories/report.factory";
import { GET } from "@/app/api/reports/route";

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/reports");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

describe("GET /api/reports", () => {
  beforeEach(() => {
    mockState.list = { data: [buildReport(), buildReport()], error: null };
  });

  it("T016 — retorna 200 com lista de reports", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeInstanceOf(Array);
    expect(json.data).toHaveLength(2);
  });

  it("T017 — retorna lista vazia quando não há reports", async () => {
    mockState.list = { data: [], error: null };
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });

  it("T018 — sempre aplica filtro neq('status', 'archived')", async () => {
    await GET(makeRequest());
    expect(mockNeq).toHaveBeenCalledWith("status", "archived");
  });

  it("T019 — filtra por category quando informada", async () => {
    await GET(makeRequest({ category: "pothole" }));
    expect(mockEq).toHaveBeenCalledWith("category", "pothole");
  });

  it("T020 — filtra por status quando informado", async () => {
    await GET(makeRequest({ status: "pending" }));
    expect(mockEq).toHaveBeenCalledWith("status", "pending");
  });

  it("T021 — filtra por severity quando informada", async () => {
    await GET(makeRequest({ severity: "high" }));
    expect(mockEq).toHaveBeenCalledWith("severity", "high");
  });

  it("T022 — filtra por neighborhood_id quando informado", async () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    await GET(makeRequest({ neighborhood_id: id }));
    expect(mockEq).toHaveBeenCalledWith("neighborhood_id", id);
  });

  it("T023 — retorna 400 quando category tem valor inválido", async () => {
    const res = await GET(makeRequest({ category: "buraco" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T024 — retorna 500 quando Supabase falha na listagem", async () => {
    mockState.list = { data: null, error: { message: "DB error", code: "PGRST001" } };
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
