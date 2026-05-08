import { vi } from "vitest";

// Mutable state — set per test in beforeEach
export const mockState = {
  list: { data: [] as any[], error: null as any },
  single: { data: null as any, error: null as any },
};

// single must NOT be included in the chain's mockReturnValue loop below,
// so its Promise-returning implementation is not overridden.
export const mockSingle = vi.fn().mockImplementation(() =>
  Promise.resolve(mockState.single)
);
export const mockSelect = vi.fn();
export const mockInsert = vi.fn();
export const mockEq = vi.fn();
export const mockNeq = vi.fn();
export const mockOrder = vi.fn();
export const mockLimit = vi.fn();

const chainMethods = {
  select: mockSelect,
  insert: mockInsert,
  eq: mockEq,
  neq: mockNeq,
  order: mockOrder,
  limit: mockLimit,
};

const chainable: Record<string, any> = { ...chainMethods };

// Fluent interface: each chain method returns the same chainable object
Object.values(chainMethods).forEach((fn) => fn.mockReturnValue(chainable));

// single returns a Promise — added AFTER forEach so it keeps its own implementation
chainable.single = mockSingle;

// then makes the whole chain directly awaitable for list queries
chainable.then = (resolve: any, reject: any) =>
  Promise.resolve(mockState.list).then(resolve, reject);

export const mockSupabaseFrom = vi.fn().mockReturnValue(chainable);
export const mockAdminClient = { from: mockSupabaseFrom };

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
