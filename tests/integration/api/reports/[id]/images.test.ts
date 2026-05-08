import { describe, it, expect, beforeEach } from "vitest";
import "@/tests/mocks/db";
import "@/tests/mocks/storage";
import { mockConfig, mockDb } from "@/tests/mocks/db";
import { mockStorageConfig } from "@/tests/mocks/storage";
import { buildReport } from "@/tests/factories/report.factory";
import { POST } from "@/app/api/reports/[id]/images/route";

const VALID_ID = "550e8400-e29b-41d4-a716-446655440000";
const IMAGE_URL = "https://storage.example.com/reports/test/image.jpg";
const STORAGE_PATH = "reports/test/image.jpg";

function makeFile(mimeType: string, sizeBytes: number = 1024): File {
  const content = new Uint8Array(sizeBytes).fill(65);
  return new File([content], "image.jpg", { type: mimeType });
}

function makeRequest(file?: File, id: string = VALID_ID): [Request, { params: Promise<{ id: string }> }] {
  const formData = new FormData();
  if (file) formData.append("file", file);
  return [
    new Request(`http://localhost/api/reports/${id}/images`, {
      method: "POST",
      body: formData,
    }),
    { params: Promise.resolve({ id }) },
  ];
}

describe("POST /api/reports/[id]/images", () => {
  beforeEach(() => {
    mockConfig.rowsSequence = [
      [buildReport({ id: VALID_ID })],
      [{ id: "img-1", image_url: IMAGE_URL, storage_path: STORAGE_PATH }],
    ];
  });

  // --- Grupo 1: Validação de arquivo ---

  it("T-I01 — retorna 400 quando nenhum arquivo é enviado", async () => {
    const res = await POST(...makeRequest(undefined));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T-I02 — retorna 400 quando MIME é text/plain", async () => {
    const res = await POST(...makeRequest(makeFile("text/plain")));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T-I03 — retorna 400 quando MIME é image/gif", async () => {
    const res = await POST(...makeRequest(makeFile("image/gif")));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T-I04 — aceita image/jpeg", async () => {
    const res = await POST(...makeRequest(makeFile("image/jpeg")));
    expect(res.status).toBe(201);
  });

  it("T-I05 — aceita image/png", async () => {
    const res = await POST(...makeRequest(makeFile("image/png")));
    expect(res.status).toBe(201);
  });

  it("T-I06 — aceita image/webp", async () => {
    const res = await POST(...makeRequest(makeFile("image/webp")));
    expect(res.status).toBe(201);
  });

  it("T-I07 — retorna 400 quando arquivo excede 5 MB", async () => {
    const fiveMbPlusOne = 5 * 1024 * 1024 + 1;
    const res = await POST(...makeRequest(makeFile("image/jpeg", fiveMbPlusOne)));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("T-I08 — aceita arquivo de exatamente 5 MB", async () => {
    const fiveMb = 5 * 1024 * 1024;
    const res = await POST(...makeRequest(makeFile("image/jpeg", fiveMb)));
    expect(res.status).toBe(201);
  });

  // --- Grupo 2: Existência do report ---

  it("T-I09 — retorna 404 quando report não existe", async () => {
    mockConfig.rowsSequence = [[]];
    const res = await POST(...makeRequest(makeFile("image/jpeg")));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  // --- Grupo 3: Sucesso ---

  it("T-I10 — retorna 201 com id, image_url e storage_path", async () => {
    const res = await POST(...makeRequest(makeFile("image/jpeg")));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBeDefined();
    expect(json.data.image_url).toBe(IMAGE_URL);
    expect(json.data.storage_path).toBe(STORAGE_PATH);
  });

  it("T-I11 — chama db.insert para criar registro em report_images", async () => {
    await POST(...makeRequest(makeFile("image/jpeg")));
    expect(mockDb.insert).toHaveBeenCalled();
  });

  // --- Grupo 4: Erros de infraestrutura ---

  it("T-I12 — retorna 500 quando o banco falha", async () => {
    mockConfig.shouldThrow = true;
    const res = await POST(...makeRequest(makeFile("image/jpeg")));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });

  it("T-I13 — retorna 500 quando o storage falha", async () => {
    mockStorageConfig.shouldThrow = true;
    const res = await POST(...makeRequest(makeFile("image/jpeg")));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("DATABASE_ERROR");
  });

  it("T-I14 — db.insert não é chamado quando o storage falha", async () => {
    mockStorageConfig.shouldThrow = true;
    await POST(...makeRequest(makeFile("image/jpeg")));
    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});
