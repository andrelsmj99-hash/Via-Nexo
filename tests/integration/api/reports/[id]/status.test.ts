import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/db";
import "@/tests/mocks/auth";
import { mockConfig, mockDb } from "@/tests/mocks/db";
import { mockAuthConfig, buildModeratorSession, buildAdminSession, buildCitizenSession } from "@/tests/mocks/auth";
import { buildReport } from "@/tests/factories/report.factory";
import { PATCH } from "@/app/api/reports/[id]/status/route";

const VALID_ID = "550e8400-e29b-41d4-a716-446655440000";
const UPDATED_AT = "2026-01-01T12:00:00.000Z";

function makeRequest(body: unknown = { status: "confirmed" }): Request {
  return new Request(`http://localhost/api/reports/${VALID_ID}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeParams(id: string = VALID_ID) {
  return { params: Promise.resolve({ id }) };
}

describe("PATCH /api/reports/[id]/status", () => {
  beforeEach(() => {
    mockAuthConfig.session = buildModeratorSession();
    mockConfig.rowsSequence = [
      [buildReport({ id: VALID_ID })],
      [{ id: VALID_ID, status: "confirmed", updated_at: UPDATED_AT }],
      [],
    ];
  });

  // --- Grupo 1: Autenticação e autorização ---

  it("T033 — retorna 401 quando não autenticado", async () => {
    mockAuthConfig.session = null;
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("T034 — retorna 403 quando usuário é citizen", async () => {
    mockAuthConfig.session = buildCitizenSession();
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe("FORBIDDEN");
  });

  it("T035 — aceita moderator como role autorizado", async () => {
    mockAuthConfig.session = buildModeratorSession();
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(200);
  });

  it("T036 — aceita admin como role autorizado", async () => {
    mockAuthConfig.session = buildAdminSession();
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(200);
  });

  // --- Grupo 2: Validação de payload ---

  it("T037 — retorna 400 quando body está ausente", async () => {
    const req = new Request(`http://localhost/api/reports/${VALID_ID}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, makeParams());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T038 — retorna 400 quando status está ausente", async () => {
    const res = await PATCH(makeRequest({}), makeParams());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T039 — retorna 400 quando status tem valor inválido", async () => {
    const res = await PATCH(makeRequest({ status: "em_andamento" }), makeParams());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T040 — aceita notes opcionais no body", async () => {
    const res = await PATCH(makeRequest({ status: "confirmed", notes: "Validado por imagem" }), makeParams());
    expect(res.status).toBe(200);
  });

  // --- Grupo 3: Lógica de negócio ---

  it("T041 — retorna 404 quando report não existe", async () => {
    mockConfig.rowsSequence = [[]];
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("T042 — chama db.update para atualizar o status", async () => {
    await PATCH(makeRequest(), makeParams());
    expect(mockDb.update).toHaveBeenCalled();
  });

  it("T043 — cria registro em moderation_logs após atualização", async () => {
    await PATCH(makeRequest(), makeParams());
    expect(mockDb.insert).toHaveBeenCalled();
  });

  // --- Grupo 4: Sucesso ---

  it("T044 — retorna 200 com id, status e updated_at no data", async () => {
    const res = await PATCH(makeRequest({ status: "confirmed" }), makeParams());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe(VALID_ID);
    expect(json.data.status).toBe("confirmed");
    expect(json.data.updated_at).toBeDefined();
  });

  it("T045 — aceita todos os status válidos", async () => {
    const statuses = ["pending", "under_review", "confirmed", "resolved", "archived"] as const;
    for (const status of statuses) {
      mockConfig.callCount = 0;
      mockConfig.rowsSequence = [
        [buildReport({ id: VALID_ID })],
        [{ id: VALID_ID, status, updated_at: UPDATED_AT }],
        [],
      ];
      const res = await PATCH(makeRequest({ status }), makeParams());
      expect(res.status).toBe(200);
    }
  });

  // --- Grupo 5: Erros de infraestrutura ---

  it("T046 — retorna 500 quando o banco falha", async () => {
    mockConfig.shouldThrow = true;
    const res = await PATCH(makeRequest(), makeParams());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
