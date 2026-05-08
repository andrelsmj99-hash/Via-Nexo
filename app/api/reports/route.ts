import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { ReportInsertSchema } from "@/lib/schemas/report.schema";
import { DEFAULT_REPORT_STATUS } from "@/lib/constants";

function validationError(details: { path: string; message: string }[]) {
  return NextResponse.json(
    { error: { code: "VALIDATION_ERROR", message: "Dados inválidos", details } },
    { status: 400 }
  );
}

function databaseError() {
  return NextResponse.json(
    { error: { code: "DATABASE_ERROR", message: "Erro ao salvar a ocorrência" } },
    { status: 500 }
  );
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
