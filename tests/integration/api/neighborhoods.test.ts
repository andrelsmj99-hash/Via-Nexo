import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/db";
import { mockConfig } from "@/tests/mocks/db";
import { buildNeighborhood } from "@/tests/factories/neighborhood.factory";
import { GET } from "@/app/api/neighborhoods/route";

describe("GET /api/neighborhoods", () => {
  beforeEach(() => {
    mockConfig.rows = [buildNeighborhood(), buildNeighborhood({ name: "Vila Madalena" })];
    mockConfig.shouldThrow = false;
  });

  it("T030 — retorna 200 com lista de bairros", async () => {
    const res = await GET(new Request("http://localhost/api/neighborhoods"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeInstanceOf(Array);
    expect(json.data).toHaveLength(2);
  });

  it("T031 — retorna lista vazia quando não há bairros cadastrados", async () => {
    mockConfig.rows = [];
    const res = await GET(new Request("http://localhost/api/neighborhoods"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });

  it("T032 — retorna 500 quando o banco falha", async () => {
    mockConfig.shouldThrow = true;
    const res = await GET(new Request("http://localhost/api/neighborhoods"));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });
});
