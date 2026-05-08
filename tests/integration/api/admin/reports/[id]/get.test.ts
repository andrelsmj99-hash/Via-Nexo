import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/db";
import "@/tests/mocks/auth";
import { mockConfig } from "@/tests/mocks/db";
import { mockAuthConfig, buildModeratorSession, buildAdminSession, buildCitizenSession } from "@/tests/mocks/auth";
import { buildReport } from "@/tests/factories/report.factory";
import { GET } from "@/app/api/admin/reports/[id]/route";

const VALID_ID = "550e8400-e29b-41d4-a716-446655440000";

function makeRequest(id: string = VALID_ID): [Request, { params: Promise<{ id: string }> }] {
  return [
    new Request(`http://localhost/api/admin/reports/${id}`),
    { params: Promise.resolve({ id }) },
  ];
}

describe("GET /api/admin/reports/[id]", () => {
  beforeEach(() => {
    mockAuthConfig.session = buildModeratorSession();
    mockConfig.rows = [buildReport({ id: VALID_ID })];
  });

  // --- Grupo 1: Autenticação e autorização ---

  it("T066 — retorna 401 quando não autenticado", async () => {
    mockAuthConfig.session = null;
    const res = await GET(...makeRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("T067 — retorna 403 quando role é citizen", async () => {
    mockAuthConfig.session = buildCitizenSession();
    const res = await GET(...makeRequest());
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe("FORBIDDEN");
  });

  it("T068 — aceita moderator como role autorizado", async () => {
    mockAuthConfig.session = buildModeratorSession();
    const res = await GET(...makeRequest());
    expect(res.status).toBe(200);
  });

  it("T069 — aceita admin como role autorizado", async () => {
    mockAuthConfig.session = buildAdminSession();
    const res = await GET(...makeRequest());
    expect(res.status).toBe(200);
  });

  // --- Grupo 2: Detalhe da ocorrência ---

  it("T070 — retorna 200 com dados do report quando encontrado", async () => {
    const res = await GET(...makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(VALID_ID);
  });

  it("T071 — retorna report com status archived (admin pode ver arquivados)", async () => {
    mockConfig.rows = [buildReport({ id: VALID_ID, status: "archived" })];
    const res = await GET(...makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe("archived");
  });

  it("T072 — retorna 404 quando report não existe", async () => {
    mockConfig.rows = [];
    const res = await GET(...makeRequest());
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  // --- Grupo 3: Erros de infraestrutura ---

  it("T073 — retorna 500 quando o banco falha", async () => {
    mockConfig.shouldThrow = true;
    const res = await GET(...makeRequest());
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
