import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { and, count, desc, eq, ne, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
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
    const conditions: SQL[] = [ne(reports.status, "archived")];
    if (filters.category) conditions.push(eq(reports.category, filters.category));
    if (filters.status) conditions.push(eq(reports.status, filters.status));
    if (filters.severity) conditions.push(eq(reports.severity, filters.severity));
    if (filters.neighborhood_id) conditions.push(eq(reports.neighborhood_id, filters.neighborhood_id));

    const [countRow] = await db
      .select({ total: count() })
      .from(reports)
      .where(and(...conditions));

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
      .where(and(...conditions))
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

  try {
    const [inserted] = await db
      .insert(reports)
      .values({
        title: parsed.title,
        description: parsed.description,
        category: parsed.category,
        severity: parsed.severity,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        address: parsed.address ?? null,
        street_name: parsed.street_name ?? null,
        neighborhood_id: parsed.neighborhood_id ?? null,
        is_anonymous: parsed.is_anonymous ?? false,
        status: DEFAULT_REPORT_STATUS,
      })
      .returning();

    if (!inserted) return databaseError();
    return NextResponse.json({ data: inserted }, { status: 201 });
  } catch {
    return databaseError();
  }
}
