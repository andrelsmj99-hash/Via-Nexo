import { vi } from "vitest";

export const mockAuthConfig = {
  session: null as any,
};

export function buildModeratorSession(overrides: any = {}) {
  return {
    user: { id: "moderator-user-id", email: "moderator@test.com", name: "Moderador", role: "moderator" },
    expires: "2099-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function buildAdminSession(overrides: any = {}) {
  return {
    user: { id: "admin-user-id", email: "admin@test.com", name: "Admin", role: "admin" },
    expires: "2099-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function buildCitizenSession(overrides: any = {}) {
  return {
    user: { id: "citizen-user-id", email: "citizen@test.com", name: "Cidadão", role: "citizen" },
    expires: "2099-01-01T00:00:00.000Z",
    ...overrides,
  };
}

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockImplementation(() => Promise.resolve(mockAuthConfig.session)),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
