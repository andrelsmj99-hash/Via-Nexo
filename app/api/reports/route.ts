import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { ReportInsertSchema, ReportListQuerySchema } from "@/lib/schemas/report.schema";
import { DEFAULT_REPORT_STATUS } from "@/lib/constants";

function validationError(details: { path: string; message: string }[]) {
  return NextResponse.json(
    { error: { code: "VALIDATION_ERROR", message: "Dados inválidos", details } },
    { status: 400 }
  );
}

function databaseError() {
  return NextResponse.json(
    { error: { code: "DATABASE_ERROR", message: "Erro interno no servidor" } },
    { status: 500 }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const rawQuery = {
    category: searchParams.get("category") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    severity: searchParams.get("severity") ?? undefined,
    neighborhood_id: searchParams.get("neighborhood_id") ?? undefined,
  };

  let filters;
  try {
    filters = ReportListQuerySchema.parse(rawQuery);
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return validationError(details);
    }
    throw err;
  }

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("reports")
    .select(
      "id, title, category, status, severity, latitude, longitude, neighborhood_id, created_at, updated_at"
    )
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (filters.category) query = (query as any).eq("category", filters.category);
  if (filters.status) query = (query as any).eq("status", filters.status);
  if (filters.severity) query = (query as any).eq("severity", filters.severity);
  if (filters.neighborhood_id) query = (query as any).eq("neighborhood_id", filters.neighborhood_id);

  const { data, error } = await (query as any);

  if (error) {
    return databaseError();
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError([{ path: "body", message: "Body inválido ou ausente" }]);
  }

  let parsed;
  try {
    parsed = ReportInsertSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return validationError(details);
    }
    throw err;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({ ...parsed, status: DEFAULT_REPORT_STATUS })
    .select()
    .single();

  if (error || !data) {
    return databaseError();
  }

  return NextResponse.json({ data }, { status: 201 });
}
