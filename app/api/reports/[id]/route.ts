import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";

function notFoundError() {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message: "Ocorrência não encontrada" } },
    { status: 404 }
  );
}

function databaseError() {
  return NextResponse.json(
    { error: { code: "DATABASE_ERROR", message: "Erro interno no servidor" } },
    { status: 500 }
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [row] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), ne(reports.status, "archived")))
      .limit(1);

    if (!row) return notFoundError();
    return NextResponse.json({ data: row });
  } catch {
    return databaseError();
  }
}
