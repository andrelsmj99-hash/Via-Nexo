import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/supabase";
import { mockState, mockNeq, mockEq } from "@/tests/mocks/supabase";
import { buildReport } from "@/tests/factories/report.factory";
import { GET } from "@/app/api/reports/[id]/route";

const VALID_ID = "550e8400-e29b-41d4-a716-446655440000";

function makeRequest(id: string = VALID_ID): [Request, { params: Promise<{ id: string }> }] {
  return [
    new Request(`http://localhost/api/reports/${id}`),
    { params: Promise.resolve({ id }) },
  ];
}

describe("GET /api/reports/[id]", () => {
  beforeEach(() => {
    mockState.single = { data: buildReport({ id: VALID_ID }), error: null };
  });

  it("T025 — retorna 200 com dados do report quando encontrado", async () => {
    const res = await GET(...makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(VALID_ID);
  });

  it("T026 — retorna 404 quando report não existe", async () => {
    mockState.single = { data: null, error: { code: "PGRST116", message: "No rows found" } };
    const res = await GET(...makeRequest());
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("T027 — aplica filtro neq('status','archived') para excluir arquivados", async () => {
    await GET(...makeRequest());
    expect(mockNeq).toHaveBeenCalledWith("status", "archived");
  });

  it("T028 — aplica filtro eq('id', id) para buscar pelo ID correto", async () => {
    await GET(...makeRequest(VALID_ID));
    expect(mockEq).toHaveBeenCalledWith("id", VALID_ID);
  });

  it("T029 — retorna 500 quando Supabase falha com erro inesperado", async () => {
    mockState.single = { data: null, error: { code: "PGRST001", message: "DB error" } };
    const res = await GET(...makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
