import { vi } from "vitest";

export const mockSingle = vi.fn();
export const mockSelect = vi.fn();
export const mockInsert = vi.fn();
export const mockEq = vi.fn();
export const mockOrder = vi.fn();
export const mockLimit = vi.fn();

const chainable = {
  select: mockSelect,
  insert: mockInsert,
  eq: mockEq,
  single: mockSingle,
  order: mockOrder,
  limit: mockLimit,
};

Object.values(chainable).forEach((fn) => fn.mockReturnValue(chainable));

export const mockSupabaseFrom = vi.fn().mockReturnValue(chainable);

export const mockAdminClient = {
  from: mockSupabaseFrom,
};

vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn(() => mockAdminClient),
  createSupabaseBrowserClient: vi.fn(() => mockAdminClient),
  getSupabaseConfig: vi.fn(() => ({
    url: "https://test.supabase.co",
    anonKey: "test-anon-key",
    serviceRoleKey: "test-service-role-key",
    reportImagesBucket: "report-images",
  })),
}));
