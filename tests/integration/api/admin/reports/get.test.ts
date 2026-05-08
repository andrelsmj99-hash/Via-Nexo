import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/db";
import "@/tests/mocks/auth";
import { mockConfig, mockDb } from "@/tests/mocks/db";
import { mockAuthConfig, buildModeratorSession, buildAdminSession, buildCitizenSession } from "@/tests/mocks/auth";
import { buildReport } from "@/tests/factories/report.factory";
import { GET } from "@/app/api/admin/reports/route";

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/admin/reports");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

describe("GET /api/admin/reports", () => {
  beforeEach(() => {
    mockAuthConfig.session = buildModeratorSession();
    mockConfig.rows = [buildReport(), buildReport({ status: "archived" })];
  });

  // --- Grupo 1: Autenticação e autorização ---

  it("T054 — retorna 401 quando não autenticado", async () => {
    mockAuthConfig.session = null;
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("T055 — retorna 403 quando role é citizen", async () => {
    mockAuthConfig.session = buildCitizenSession();
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe("FORBIDDEN");
  });

  it("T056 — aceita moderator como role autorizado", async () => {
    mockAuthConfig.session = buildModeratorSession();
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
  });

  it("T057 — aceita admin como role autorizado", async () => {
    mockAuthConfig.session = buildAdminSession();
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
  });

  // --- Grupo 2: Listagem e filtros ---

  it("T058 — retorna 200 com lista incluindo reports arquivados", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeInstanceOf(Array);
    expect(json.data).toHaveLength(2);
  });

  it("T059 — retorna lista vazia quando não há reports", async () => {
    mockConfig.rows = [];
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });

  it("T060 — aplica filtro quando status é informado (incluindo archived)", async () => {
    await GET(makeRequest({ status: "archived" }));
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T061 — aplica filtro quando category é informada", async () => {
    await GET(makeRequest({ category: "pothole" }));
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T062 — aplica filtro quando severity é informada", async () => {
    await GET(makeRequest({ severity: "high" }));
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T063 — aplica filtro quando neighborhood_id é informado", async () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    await GET(makeRequest({ neighborhood_id: id }));
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("T064 — retorna 400 quando filtro tem valor inválido", async () => {
    const res = await GET(makeRequest({ category: "invalida" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  // --- Grupo 3: Erros de infraestrutura ---

  it("T065 — retorna 500 quando o banco falha", async () => {
    mockConfig.shouldThrow = true;
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
