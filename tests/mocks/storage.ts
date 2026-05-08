import { vi, beforeEach } from "vitest";

export const mockStorageConfig = {
  result: { url: "https://storage.example.com/reports/test/image.jpg", path: "reports/test/image.jpg" },
  shouldThrow: false,
};

beforeEach(() => {
  mockStorageConfig.result = {
    url: "https://storage.example.com/reports/test/image.jpg",
    path: "reports/test/image.jpg",
  };
  mockStorageConfig.shouldThrow = false;
});

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn().mockImplementation(() =>
    mockStorageConfig.shouldThrow
      ? Promise.reject(new Error("Storage error"))
      : Promise.resolve(mockStorageConfig.result)
  ),
}));
