import { vi } from "vitest";

export const mockConfig = {
  rows: [] as any[],
  shouldThrow: false,
  throwError: new Error("Database error"),
};

const chainable: Record<string, any> = {};

["select", "from", "where", "orderBy", "limit", "insert", "values"].forEach((m) => {
  chainable[m] = vi.fn().mockReturnValue(chainable);
});

chainable.returning = vi.fn().mockImplementation(() =>
  mockConfig.shouldThrow
    ? Promise.reject(mockConfig.throwError)
    : Promise.resolve(mockConfig.rows)
);

chainable.then = (resolve: any, reject: any) =>
  (mockConfig.shouldThrow
    ? Promise.reject(mockConfig.throwError)
    : Promise.resolve(mockConfig.rows)
  ).then(resolve, reject);

export const mockDb = { ...chainable };

vi.mock("@/lib/db", () => ({ db: mockDb }));
