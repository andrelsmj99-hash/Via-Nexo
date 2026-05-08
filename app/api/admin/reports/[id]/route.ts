import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";

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
  const session = await auth();
  if (!session?.user) return unauthorizedError();

  const user = session.user as { role: string };
  if (user.role !== "moderator" && user.role !== "admin") return forbiddenError();

  const { id } = await params;

  try {
    const [row] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!row) return notFoundError();
    return NextResponse.json({ data: row });
  } catch {
    return databaseError();
  }
}
