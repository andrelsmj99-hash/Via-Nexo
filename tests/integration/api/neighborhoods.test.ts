import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/supabase";
import { mockState } from "@/tests/mocks/supabase";
import { buildNeighborhood } from "@/tests/factories/neighborhood.factory";
import { GET } from "@/app/api/neighborhoods/route";

describe("GET /api/neighborhoods", () => {
  beforeEach(() => {
    mockState.list = {
      data: [buildNeighborhood(), buildNeighborhood({ name: "Vila Madalena" })],
      error: null,
    };
  });

  it("T030 — retorna 200 com lista de bairros", async () => {
    const res = await GET(new Request("http://localhost/api/neighborhoods"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeInstanceOf(Array);
    expect(json.data).toHaveLength(2);
  });

  it("T031 — retorna lista vazia quando não há bairros cadastrados", async () => {
    mockState.list = { data: [], error: null };
    const res = await GET(new Request("http://localhost/api/neighborhoods"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });

  it("T032 — retorna 500 quando Supabase falha", async () => {
    mockState.list = { data: null, error: { message: "DB error", code: "PGRST001" } };
    const res = await GET(new Request("http://localhost/api/neighborhoods"));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
