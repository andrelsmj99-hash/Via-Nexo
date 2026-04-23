import type { ModerationAction } from "../lib/constants";

export interface ModerationLog {
  id: string;
  report_id: string;
  moderator_id: string;
  action: ModerationAction;
  notes: string | null;
  created_at: string;
}

export interface ModerationLogInsert {
  report_id: string;
  moderator_id: string;
  action: ModerationAction;
  notes?: string | null;
}
