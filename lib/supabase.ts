import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { REPORT_IMAGES_BUCKET } from "./constants";

type SupabaseEnvironmentVariable =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string | null;
  reportImagesBucket: string;
}

function readEnvironmentVariable(name: SupabaseEnvironmentVariable): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: readEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: readEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
    reportImagesBucket: REPORT_IMAGES_BUCKET,
  };
}

export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

export const createSupabaseClient = createSupabaseBrowserClient;

// Trusted server work should use the service role client inside Route Handlers.
export function createSupabaseAdminClient(): SupabaseClient {
  const { url, serviceRoleKey } = getSupabaseConfig();

  if (!serviceRoleKey) {
    throw new Error(
      "Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
