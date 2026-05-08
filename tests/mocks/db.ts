import { vi, beforeEach } from "vitest";

export const mockConfig = {
  rows: [] as any[],
  rowsSequence: null as any[][] | null,
  callCount: 0,
  shouldThrow: false,
  throwError: new Error("Database error"),
};

const chainable: Record<string, any> = {};

["select", "from", "where", "orderBy", "limit", "insert", "values", "update", "set"].forEach((m) => {
  chainable[m] = vi.fn().mockReturnValue(chainable);
});

function getNextRows(): any[] {
  if (mockConfig.rowsSequence) {
    const rows = mockConfig.rowsSequence[mockConfig.callCount] ?? [];
    mockConfig.callCount++;
    return rows;
  }
  return mockConfig.rows;
}

chainable.returning = vi.fn().mockImplementation(() => {
  const rows = getNextRows();
  return mockConfig.shouldThrow
    ? Promise.reject(mockConfig.throwError)
    : Promise.resolve(rows);
});

chainable.then = (resolve: any, reject: any) => {
  const rows = getNextRows();
  return (mockConfig.shouldThrow
    ? Promise.reject(mockConfig.throwError)
    : Promise.resolve(rows)
  ).then(resolve, reject);
};

export const mockDb = { ...chainable };

beforeEach(() => {
  mockConfig.rows = [];
  mockConfig.rowsSequence = null;
  mockConfig.callCount = 0;
  mockConfig.shouldThrow = false;
  mockConfig.throwError = new Error("Database error");
});

vi.mock("@/lib/db", () => ({ db: mockDb }));
