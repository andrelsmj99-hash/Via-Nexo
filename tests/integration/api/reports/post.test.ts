import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/supabase";
import { mockSingle, mockState } from "@/tests/mocks/supabase";
import { buildReportInsert, buildReport } from "@/tests/factories/report.factory";
import { POST } from "@/app/api/reports/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/reports", () => {
  beforeEach(() => {
    mockState.single = { data: buildReport(), error: null };
    mockSingle.mockImplementation(() => Promise.resolve(mockState.single));
  });

  // --- Grupo 1: Validação de payload ---

  it("T001 — retorna 400 quando o body está ausente (requisição sem body)", async () => {
    const req = new Request("http://localhost/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T002 — retorna 400 quando title está ausente", async () => {
    const { title: _, ...rest } = buildReportInsert();
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T003 — retorna 400 quando title tem menos de 5 caracteres", async () => {
    const res = await POST(makeRequest(buildReportInsert({ title: "Bur" })));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.details).toBeInstanceOf(Array);
  });

  it("T004 — retorna 400 quando category é valor inválido", async () => {
    const res = await POST(makeRequest(buildReportInsert({ category: "buraco" as never })));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T005 — retorna 400 quando severity está ausente", async () => {
    const { severity: _, ...rest } = buildReportInsert();
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T006 — retorna 400 quando latitude está fora do intervalo [-90, 90]", async () => {
    const res = await POST(makeRequest(buildReportInsert({ latitude: 91 })));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T007 — retorna 400 quando longitude está fora do intervalo [-180, 180]", async () => {
    const res = await POST(makeRequest(buildReportInsert({ longitude: -200 })));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T008 — retorna 400 quando description tem menos de 10 caracteres", async () => {
    const res = await POST(makeRequest(buildReportInsert({ description: "Curto" })));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  // --- Grupo 2: Regras de negócio ---

  it("T009 — ignora status informado no body e força 'pending'", async () => {
    const payload = { ...buildReportInsert(), status: "confirmed" };
    const res = await POST(makeRequest(payload));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.status).toBe("pending");
  });

  it("T010 — define is_anonymous como false quando não informado", async () => {
    const { is_anonymous: _, ...rest } = buildReportInsert();
    mockState.single = { data: buildReport({ is_anonymous: false }), error: null };
    const res = await POST(makeRequest(rest));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.is_anonymous).toBe(false);
  });

  // --- Grupo 3: Sucesso ---

  it("T011 — retorna 201 com report criado quando payload é válido", async () => {
    const res = await POST(makeRequest(buildReportInsert()));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBeDefined();
  });

  it("T012 — retorno sempre contém status = 'pending'", async () => {
    const res = await POST(makeRequest(buildReportInsert()));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.status).toBe("pending");
  });

  it("T013 — aceita relatório anônimo (is_anonymous = true)", async () => {
    mockState.single = { data: buildReport({ is_anonymous: true, user_id: null }), error: null };
    const res = await POST(makeRequest(buildReportInsert({ is_anonymous: true })));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.is_anonymous).toBe(true);
  });

  it("T014 — aceita campos opcionais ausentes (address, street_name, neighborhood_id)", async () => {
    const payload = buildReportInsert({
      address: undefined,
      street_name: undefined,
      neighborhood_id: undefined,
    });
    const res = await POST(makeRequest(payload));
    expect(res.status).toBe(201);
  });

  // --- Grupo 4: Erros de infraestrutura ---

  it("T015 — retorna 500 quando Supabase insert falha", async () => {
    mockState.single = { data: null, error: { message: "Database error", code: "PGRST001" } };
    const res = await POST(makeRequest(buildReportInsert()));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
