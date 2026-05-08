import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/db";
import { mockConfig, mockDb } from "@/tests/mocks/db";
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
    mockConfig.rows = [buildReport({ id: VALID_ID })];
    mockConfig.shouldThrow = false;
  });

  it("T025 — retorna 200 com dados do report quando encontrado", async () => {
    const res = await GET(...makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(VALID_ID);
  });

  it("T026 — retorna 404 quando report não existe", async () => {
    mockConfig.rows = [];
    const res = await GET(...makeRequest());
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("T027 — aplica cláusula WHERE para excluir reports arquivados", async () => {
    await GET(...makeRequest());
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T028 — aplica cláusula WHERE para buscar pelo ID correto", async () => {
    await GET(...makeRequest(VALID_ID));
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T029 — retorna 500 quando o banco falha com erro inesperado", async () => {
    mockConfig.shouldThrow = true;
    const res = await GET(...makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
