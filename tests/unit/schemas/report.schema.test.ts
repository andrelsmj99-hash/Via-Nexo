import { describe, it, expect } from "vitest";
import { ReportInsertSchema } from "@/lib/schemas/report.schema";
import { buildReportInsert } from "@/tests/factories/report.factory";

describe("ReportInsertSchema", () => {
  it("valida payload completo e válido", () => {
    const result = ReportInsertSchema.safeParse(buildReportInsert());
    expect(result.success).toBe(true);
  });

  it("title com menos de 5 caracteres é inválido", () => {
    const result = ReportInsertSchema.safeParse(buildReportInsert({ title: "Bur" }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("title");
  });

  it("title ausente é inválido", () => {
    const { title: _, ...rest } = buildReportInsert();
    const result = ReportInsertSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("description com menos de 10 caracteres é inválido", () => {
    const result = ReportInsertSchema.safeParse(buildReportInsert({ description: "Curto" }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("description");
  });

  it("category com valor inválido é rejeitado", () => {
    const result = ReportInsertSchema.safeParse(
      buildReportInsert({ category: "buraco" as never })
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("category");
  });

  it("severity com valor inválido é rejeitado", () => {
    const result = ReportInsertSchema.safeParse(
      buildReportInsert({ severity: "urgente" as never })
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("severity");
  });

  it("latitude fora do intervalo [-90, 90] é inválida", () => {
    const result = ReportInsertSchema.safeParse(buildReportInsert({ latitude: 91 }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("latitude");
  });

  it("longitude fora do intervalo [-180, 180] é inválida", () => {
    const result = ReportInsertSchema.safeParse(buildReportInsert({ longitude: -181 }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("longitude");
  });

  it("is_anonymous assume false como padrão quando ausente", () => {
    const { is_anonymous: _, ...rest } = buildReportInsert();
    const result = ReportInsertSchema.safeParse(rest);
    expect(result.success).toBe(true);
    expect(result.data?.is_anonymous).toBe(false);
  });

  it("neighborhood_id inválido (não UUID) é rejeitado", () => {
    const result = ReportInsertSchema.safeParse(
      buildReportInsert({ neighborhood_id: "nao-e-uuid" })
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("neighborhood_id");
  });

  it("campos opcionais ausentes são aceitos", () => {
    const result = ReportInsertSchema.safeParse(
      buildReportInsert({ address: undefined, street_name: undefined, neighborhood_id: undefined })
    );
    expect(result.success).toBe(true);
  });

  it("aceita todos os valores válidos de category", () => {
    const categories = ["pothole", "irregular_patch", "unpaved_road", "flooding", "construction", "poor_signage"] as const;
    for (const category of categories) {
      const result = ReportInsertSchema.safeParse(buildReportInsert({ category }));
      expect(result.success).toBe(true);
    }
  });

  it("aceita todos os valores válidos de severity", () => {
    const severities = ["low", "medium", "high", "critical"] as const;
    for (const severity of severities) {
      const result = ReportInsertSchema.safeParse(buildReportInsert({ severity }));
      expect(result.success).toBe(true);
    }
  });
});
