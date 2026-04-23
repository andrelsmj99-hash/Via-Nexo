import type {
  ReportCategory,
  ReportSeverity,
  ReportStatus,
} from "../lib/constants";

export interface Report {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  severity: ReportSeverity;
  latitude: number;
  longitude: number;
  address: string | null;
  street_name: string | null;
  neighborhood_id: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportInsert {
  user_id?: string | null;
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportSeverity;
  latitude: number;
  longitude: number;
  address?: string | null;
  street_name?: string | null;
  neighborhood_id?: string | null;
  is_anonymous?: boolean;
}

export interface ReportSummary {
  id: string;
  title: string;
  category: ReportCategory;
  status: ReportStatus;
  severity: ReportSeverity;
  latitude: number;
  longitude: number;
  neighborhood_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportImage {
  id: string;
  report_id: string;
  image_url: string;
  storage_path: string;
  created_at: string;
}

export interface ReportImageInsert {
  report_id: string;
  image_url: string;
  storage_path: string;
}

export interface ReportConfirmation {
  id: string;
  report_id: string;
  user_id: string;
  created_at: string;
}

export interface ReportConfirmationInsert {
  report_id: string;
  user_id: string;
}
