import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { neighborhoods } from "@/lib/db/schema";

function databaseError() {
  return NextResponse.json(
    { error: { code: "DATABASE_ERROR", message: "Erro interno no servidor" } },
    { status: 500 }
  );
}

export async function GET(_request: Request) {
  try {
    const rows = await db
      .select({ id: neighborhoods.id, name: neighborhoods.name })
      .from(neighborhoods)
      .orderBy(asc(neighborhoods.name));

    return NextResponse.json({ data: rows });
  } catch {
    return databaseError();
  }
}
