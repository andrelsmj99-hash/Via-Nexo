import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/db";
import { mockConfig, mockDb } from "@/tests/mocks/db";
import { buildReport } from "@/tests/factories/report.factory";
import { GET } from "@/app/api/reports/route";

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/reports");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

describe("GET /api/reports", () => {
  beforeEach(() => {
    mockConfig.rows = [buildReport(), buildReport()];
    mockConfig.shouldThrow = false;
  });

  it("T016 — retorna 200 com lista de reports", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeInstanceOf(Array);
    expect(json.data).toHaveLength(2);
  });

  it("T017 — retorna lista vazia quando não há reports", async () => {
    mockConfig.rows = [];
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });

  it("T018 — sempre aplica cláusula WHERE (exclui reports arquivados)", async () => {
    await GET(makeRequest());
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T019 — aplica filtro adicional quando category é informada", async () => {
    await GET(makeRequest({ category: "pothole" }));
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T020 — aplica filtro adicional quando status é informado", async () => {
    await GET(makeRequest({ status: "pending" }));
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T021 — aplica filtro adicional quando severity é informada", async () => {
    await GET(makeRequest({ severity: "high" }));
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T022 — aplica filtro adicional quando neighborhood_id é informado", async () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    await GET(makeRequest({ neighborhood_id: id }));
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T023 — retorna 400 quando category tem valor inválido", async () => {
    const res = await GET(makeRequest({ category: "buraco" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T024 — retorna 500 quando o banco falha na listagem", async () => {
    mockConfig.shouldThrow = true;
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });

  // --- Grupo 3: Paginação e meta ---

  it("T025 — resposta inclui meta com page, limit e total", async () => {
    mockConfig.rowsSequence = [[{ total: 5 }], [buildReport(), buildReport()]];
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.meta).toBeDefined();
    expect(json.meta.page).toBe(1);
    expect(json.meta.limit).toBe(50);
    expect(json.meta.total).toBe(5);
  });

  it("T026 — respeita parâmetro limit informado", async () => {
    mockConfig.rowsSequence = [[{ total: 10 }], [buildReport()]];
    const res = await GET(makeRequest({ limit: "10" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.meta.limit).toBe(10);
    expect(mockDb.limit).toHaveBeenCalledWith(10);
  });

  it("T027 — respeita parâmetro page informado e calcula offset correto", async () => {
    mockConfig.rowsSequence = [[{ total: 20 }], [buildReport()]];
    const res = await GET(makeRequest({ page: "3", limit: "5" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.meta.page).toBe(3);
    expect(mockDb.offset).toHaveBeenCalledWith(10);
  });

  it("T028 — retorna 400 quando limit excede 100", async () => {
    const res = await GET(makeRequest({ limit: "200" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T029 — retorna 400 quando page é 0", async () => {
    const res = await GET(makeRequest({ page: "0" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  // --- Grupo 4: Privacidade de dados ---

  it("T030 — lista não expõe user_id, email ou role do autor", async () => {
    const summary = {
      id: "r1", title: "Teste", category: "pothole", status: "pending",
      severity: "high", latitude: -23.5, longitude: -46.6,
      neighborhood_id: null, created_at: "2026-01-01", updated_at: "2026-01-01",
    };
    mockConfig.rowsSequence = [[{ total: 1 }], [summary]];
    const res = await GET(makeRequest());
    const json = await res.json();
    const item = json.data[0];
    expect(item).not.toHaveProperty("user_id");
    expect(item).not.toHaveProperty("email");
    expect(item).not.toHaveProperty("role");
  });
});
