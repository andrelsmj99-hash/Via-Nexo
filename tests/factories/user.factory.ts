import type { User } from "@/types/user";

let idCounter = 1;

export function buildUser(overrides: Partial<User> = {}): User {
  const id = `user-${idCounter++}`;
  return {
    id,
    name: "João da Silva",
    email: `joao-${id}@example.com`,
    role: "citizen",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
