import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports, moderation_logs } from "@/lib/db/schema";
import { StatusUpdateSchema } from "@/lib/schemas/report.schema";
import type { ReportStatus, ModerationAction } from "@/lib/constants";

const STATUS_TO_ACTION: Record<ReportStatus, ModerationAction> = {
  pending: "reopen",
  under_review: "approve",
  confirmed: "approve",
  resolved: "resolve",
  archived: "archive",
};

function unauthorizedError() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Autenticação necessária" } },
    { status: 401 }
  );
}

function forbiddenError() {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message: "Acesso negado" } },
    { status: 403 }
  );
}

function notFoundError() {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message: "Ocorrência não encontrada" } },
    { status: 404 }
  );
}

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedError();

  const user = session.user as { id: string; role: string };
  if (user.role !== "moderator" && user.role !== "admin") return forbiddenError();

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError([{ path: "body", message: "Body inválido ou ausente" }]);
  }

  let parsed;
  try {
    parsed = StatusUpdateSchema.parse(body);
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

  try {
    const [report] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) return notFoundError();

    const [updated] = await db
      .update(reports)
      .set({ status: parsed.status, updated_at: new Date().toISOString() })
      .where(eq(reports.id, id))
      .returning();

    await db.insert(moderation_logs).values({
      report_id: id,
      moderator_id: user.id,
      action: STATUS_TO_ACTION[parsed.status],
      notes: parsed.notes ?? null,
    });

    return NextResponse.json({
      data: { id: updated.id, status: updated.status, updated_at: updated.updated_at },
    });
  } catch {
    return databaseError();
  }
}
