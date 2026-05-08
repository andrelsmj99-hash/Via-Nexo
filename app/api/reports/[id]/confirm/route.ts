import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports, report_confirmations } from "@/lib/db/schema";

function unauthorizedError() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Autenticação necessária" } },
    { status: 401 }
  );
}

function notFoundError() {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message: "Ocorrência não encontrada" } },
    { status: 404 }
  );
}

function alreadyConfirmedError() {
  return NextResponse.json(
    { error: { code: "ALREADY_CONFIRMED", message: "Você já confirmou esta ocorrência" } },
    { status: 409 }
  );
}

function databaseError() {
  return NextResponse.json(
    { error: { code: "DATABASE_ERROR", message: "Erro interno no servidor" } },
    { status: 500 }
  );
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return unauthorizedError();

  const user = session.user as { id: string };
  const { id } = await params;

  try {
    const [report] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(and(eq(reports.id, id), ne(reports.status, "archived")))
      .limit(1);

    if (!report) return notFoundError();

    const [existing] = await db
      .select({ id: report_confirmations.id })
      .from(report_confirmations)
      .where(
        and(
          eq(report_confirmations.report_id, id),
          eq(report_confirmations.user_id, user.id)
        )
      )
      .limit(1);

    if (existing) return alreadyConfirmedError();

    await db.insert(report_confirmations).values({ report_id: id, user_id: user.id });

    const allConfirmations = await db
      .select({ id: report_confirmations.id })
      .from(report_confirmations)
      .where(eq(report_confirmations.report_id, id));

    return NextResponse.json(
      { data: { report_id: id, confirmations_count: allConfirmations.length } },
      { status: 201 }
    );
  } catch {
    return databaseError();
  }
}
