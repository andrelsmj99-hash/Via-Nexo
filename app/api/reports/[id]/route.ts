import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

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

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .neq("status", "archived")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return notFoundError();
    }
    return databaseError();
  }

  if (!data) {
    return notFoundError();
  }

  return NextResponse.json({ data });
}
