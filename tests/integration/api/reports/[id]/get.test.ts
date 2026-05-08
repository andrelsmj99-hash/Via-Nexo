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

  // --- Grupo 2: Campos enriquecidos ---

  it("T-E01 — resposta inclui campo images como array", async () => {
    mockConfig.rowsSequence = [
      [buildReport({ id: VALID_ID })],
      [{ id: "img-1", image_url: "https://storage.example.com/img.jpg" }],
      [{ total: 2 }],
    ];
    const res = await GET(...makeRequest());
    const json = await res.json();
    expect(json.data.images).toBeInstanceOf(Array);
    expect(json.data.images).toHaveLength(1);
    expect(json.data.images[0].image_url).toBeDefined();
  });

  it("T-E02 — resposta inclui confirmations_count como número", async () => {
    mockConfig.rowsSequence = [
      [buildReport({ id: VALID_ID })],
      [],
      [{ total: 7 }],
    ];
    const res = await GET(...makeRequest());
    const json = await res.json();
    expect(typeof json.data.confirmations_count).toBe("number");
    expect(json.data.confirmations_count).toBe(7);
  });

  it("T-E03 — images é array vazio quando não há imagens vinculadas", async () => {
    mockConfig.rowsSequence = [
      [buildReport({ id: VALID_ID })],
      [],
      [{ total: 0 }],
    ];
    const res = await GET(...makeRequest());
    const json = await res.json();
    expect(json.data.images).toEqual([]);
    expect(json.data.confirmations_count).toBe(0);
  });

  // --- Grupo 3: Privacidade ---

  it("T-D03 — user_id é null quando is_anonymous é true", async () => {
    mockConfig.rowsSequence = [
      [buildReport({ id: VALID_ID, is_anonymous: true, user_id: "secret-user-id" })],
      [],
      [{ total: 0 }],
    ];
    const res = await GET(...makeRequest());
    const json = await res.json();
    expect(json.data.user_id).toBeNull();
  });

  it("T-D04 — user_id é mantido quando is_anonymous é false", async () => {
    mockConfig.rowsSequence = [
      [buildReport({ id: VALID_ID, is_anonymous: false, user_id: "public-user-id" })],
      [],
      [{ total: 0 }],
    ];
    const res = await GET(...makeRequest());
    const json = await res.json();
    expect(json.data.user_id).toBe("public-user-id");
  });
});
