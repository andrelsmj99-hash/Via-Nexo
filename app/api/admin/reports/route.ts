import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { and, count, desc, eq, SQL } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { ReportListQuerySchema } from "@/lib/schemas/report.schema";

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
  const session = await auth();
  if (!session?.user) return unauthorizedError();

  const user = session.user as { role: string };
  if (user.role !== "moderator" && user.role !== "admin") return forbiddenError();

  const { searchParams } = new URL(request.url);

  const rawQuery = {
    category: searchParams.get("category") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    severity: searchParams.get("severity") ?? undefined,
    neighborhood_id: searchParams.get("neighborhood_id") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
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

  const offset = (filters.page - 1) * filters.limit;

  try {
    const conditions: SQL[] = [];
    if (filters.category) conditions.push(eq(reports.category, filters.category));
    if (filters.status) conditions.push(eq(reports.status, filters.status));
    if (filters.severity) conditions.push(eq(reports.severity, filters.severity));
    if (filters.neighborhood_id) conditions.push(eq(reports.neighborhood_id, filters.neighborhood_id));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ total: count() })
      .from(reports)
      .where(whereClause);

    const rows = await db
      .select({
        id: reports.id,
        title: reports.title,
        category: reports.category,
        status: reports.status,
        severity: reports.severity,
        latitude: reports.latitude,
        longitude: reports.longitude,
        neighborhood_id: reports.neighborhood_id,
        created_at: reports.created_at,
        updated_at: reports.updated_at,
      })
      .from(reports)
      .where(whereClause)
      .orderBy(desc(reports.created_at))
      .limit(filters.limit)
      .offset(offset);

    return NextResponse.json({
      data: rows,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total: Number(countRow?.total ?? 0),
      },
    });
  } catch {
    return databaseError();
  }
}
