import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

function databaseError() {
  return NextResponse.json(
    { error: { code: "DATABASE_ERROR", message: "Erro interno no servidor" } },
    { status: 500 }
  );
}

export async function GET(_request: Request) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    return databaseError();
  }

  return NextResponse.json({ data: data ?? [] });
}
