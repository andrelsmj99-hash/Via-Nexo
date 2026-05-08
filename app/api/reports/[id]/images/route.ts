import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reports, report_images } from "@/lib/db/schema";
import { uploadFile } from "@/lib/storage";
import { REPORT_IMAGE_ALLOWED_MIME_TYPES, REPORT_IMAGE_MAX_SIZE_BYTES } from "@/lib/constants";

function validationError(details: { path: string; message: string }[]) {
  return NextResponse.json(
    { error: { code: "VALIDATION_ERROR", message: "Dados inválidos", details } },
    { status: 400 }
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return validationError([{ path: "body", message: "Payload inválido" }]);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return validationError([{ path: "file", message: "Arquivo obrigatório" }]);
  }

  if (!REPORT_IMAGE_ALLOWED_MIME_TYPES.includes(file.type as never)) {
    return validationError([{
      path: "file",
      message: `Tipo de arquivo não permitido. Aceitos: ${REPORT_IMAGE_ALLOWED_MIME_TYPES.join(", ")}`,
    }]);
  }

  if (file.size > REPORT_IMAGE_MAX_SIZE_BYTES) {
    return validationError([{ path: "file", message: "Arquivo excede o tamanho máximo de 5 MB" }]);
  }

  try {
    const [report] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) return notFoundError();

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `reports/${id}/${Date.now()}-${file.name}`;
    const { url, path } = await uploadFile(buffer, { path: storagePath, mimeType: file.type });

    const [image] = await db
      .insert(report_images)
      .values({ report_id: id, image_url: url, storage_path: path })
      .returning();

    return NextResponse.json(
      { data: { id: image.id, image_url: image.image_url, storage_path: image.storage_path } },
      { status: 201 }
    );
  } catch {
    return databaseError();
  }
}
