import { describe, it, expect } from "vitest";
import { StatusUpdateSchema } from "@/lib/schemas/report.schema";

describe("StatusUpdateSchema", () => {
  it("valida payload com status válido", () => {
    const result = StatusUpdateSchema.safeParse({ status: "confirmed" });
    expect(result.success).toBe(true);
  });

  it("status ausente é inválido", () => {
    const result = StatusUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("status");
  });

  it("status com valor fora do enum é rejeitado", () => {
    const result = StatusUpdateSchema.safeParse({ status: "invalid_status" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("status");
  });

  it("aceita todos os valores válidos de status", () => {
    const statuses = ["pending", "under_review", "confirmed", "resolved", "archived"] as const;
    for (const status of statuses) {
      const result = StatusUpdateSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it("notes é opcional — payload sem notes é válido", () => {
    const result = StatusUpdateSchema.safeParse({ status: "pending" });
    expect(result.success).toBe(true);
    expect(result.data?.notes).toBeUndefined();
  });

  it("notes com mais de 1000 caracteres é rejeitado", () => {
    const result = StatusUpdateSchema.safeParse({ status: "pending", notes: "x".repeat(1001) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("notes");
  });

  it("notes com exatamente 1000 caracteres é aceito", () => {
    const result = StatusUpdateSchema.safeParse({ status: "pending", notes: "x".repeat(1000) });
    expect(result.success).toBe(true);
  });
});
