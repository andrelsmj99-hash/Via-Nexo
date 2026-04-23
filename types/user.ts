import type { UserRole } from "../lib/constants";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface UserInsert {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
}

export interface UserSummary {
  id: string;
  name: string;
  role: UserRole;
}
