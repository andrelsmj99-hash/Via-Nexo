import { NextResponse } from "next/server";
import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { reports, report_images, report_confirmations } from "@/lib/db/schema";

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

    const images = await db
      .select({ id: report_images.id, image_url: report_images.image_url })
      .from(report_images)
      .where(eq(report_images.report_id, id));

    const [countRow] = await db
      .select({ total: count() })
      .from(report_confirmations)
      .where(eq(report_confirmations.report_id, id));

    return NextResponse.json({
      data: {
        ...row,
        user_id: row.is_anonymous ? null : row.user_id,
        images,
        confirmations_count: Number(countRow?.total ?? 0),
      },
    });
  } catch {
    return databaseError();
  }
}
