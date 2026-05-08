import { z } from "zod";
import { REPORT_CATEGORIES, REPORT_SEVERITIES } from "@/lib/constants";

export const ReportInsertSchema = z.object({
  title: z
    .string({ required_error: "title é obrigatório" })
    .min(5, "title deve ter pelo menos 5 caracteres")
    .max(200, "title deve ter no máximo 200 caracteres"),
  description: z
    .string({ required_error: "description é obrigatório" })
    .min(10, "description deve ter pelo menos 10 caracteres")
    .max(2000, "description deve ter no máximo 2000 caracteres"),
  category: z.enum(REPORT_CATEGORIES, {
    required_error: "category é obrigatório",
    message: `category deve ser um de: ${REPORT_CATEGORIES.join(", ")}`,
  }),
  severity: z.enum(REPORT_SEVERITIES, {
    required_error: "severity é obrigatório",
    message: `severity deve ser um de: ${REPORT_SEVERITIES.join(", ")}`,
  }),
  latitude: z
    .number({ required_error: "latitude é obrigatória", invalid_type_error: "latitude deve ser um número" })
    .min(-90, "latitude deve ser >= -90")
    .max(90, "latitude deve ser <= 90"),
  longitude: z
    .number({ required_error: "longitude é obrigatória", invalid_type_error: "longitude deve ser um número" })
    .min(-180, "longitude deve ser >= -180")
    .max(180, "longitude deve ser <= 180"),
  address: z.string().max(500).optional().nullable(),
  street_name: z.string().max(200).optional().nullable(),
  neighborhood_id: z.string().uuid("neighborhood_id deve ser um UUID válido").optional().nullable(),
  is_anonymous: z.boolean().default(false),
});

export type ReportInsertInput = z.infer<typeof ReportInsertSchema>;

export const StatusUpdateSchema = z.object({
  status: z.enum(["under_review", "confirmed", "resolved", "archived", "pending"] as const, {
    required_error: "status é obrigatório",
    message: "status inválido",
  }),
  notes: z.string().max(1000).optional(),
});

export type StatusUpdateInput = z.infer<typeof StatusUpdateSchema>;
