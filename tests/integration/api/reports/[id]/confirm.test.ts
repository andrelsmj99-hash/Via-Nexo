import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/db";
import "@/tests/mocks/auth";
import { mockConfig } from "@/tests/mocks/db";
import { mockAuthConfig, buildCitizenSession } from "@/tests/mocks/auth";
import { buildReport } from "@/tests/factories/report.factory";
import { buildConfirmation } from "@/tests/factories/confirmation.factory";
import { POST } from "@/app/api/reports/[id]/confirm/route";

const VALID_ID = "550e8400-e29b-41d4-a716-446655440000";

function makeRequest(): Request {
  return new Request(`http://localhost/api/reports/${VALID_ID}/confirm`, {
    method: "POST",
  });
}

function makeParams(id: string = VALID_ID) {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/reports/[id]/confirm", () => {
  beforeEach(() => {
    mockAuthConfig.session = buildCitizenSession();
    mockConfig.rowsSequence = [
      [buildReport({ id: VALID_ID })],
      [],
      [],
      [buildConfirmation(), buildConfirmation()],
    ];
  });

  // --- Grupo 1: Autenticação ---

  it("T047 — retorna 401 quando não autenticado", async () => {
    mockAuthConfig.session = null;
    const res = await POST(makeRequest(), makeParams());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  // --- Grupo 2: Existência da ocorrência ---

  it("T048 — retorna 404 quando report não existe", async () => {
    mockConfig.rowsSequence = [[]];
    const res = await POST(makeRequest(), makeParams());
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("T049 — retorna 404 quando report está arquivado", async () => {
    mockConfig.rowsSequence = [[]];
    const res = await POST(makeRequest(), makeParams());
    expect(res.status).toBe(404);
  });

  // --- Grupo 3: Regras de negócio ---

  it("T050 — retorna 409 quando usuário já confirmou a ocorrência", async () => {
    mockConfig.rowsSequence = [
      [buildReport({ id: VALID_ID })],
      [buildConfirmation({ report_id: VALID_ID, user_id: "citizen-user-id" })],
    ];
    const res = await POST(makeRequest(), makeParams());
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error.code).toBe("ALREADY_CONFIRMED");
  });

  // --- Grupo 4: Sucesso ---

  it("T051 — retorna 201 com confirmação criada", async () => {
    const res = await POST(makeRequest(), makeParams());
    expect(res.status).toBe(201);
  });

  it("T052 — retorna report_id e confirmations_count no data", async () => {
    const res = await POST(makeRequest(), makeParams());
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.report_id).toBe(VALID_ID);
    expect(typeof json.data.confirmations_count).toBe("number");
    expect(json.data.confirmations_count).toBe(2);
  });

  // --- Grupo 5: Erros de infraestrutura ---

  it("T053 — retorna 500 quando o banco falha", async () => {
    mockConfig.shouldThrow = true;
    const res = await POST(makeRequest(), makeParams());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
