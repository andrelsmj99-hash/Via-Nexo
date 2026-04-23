export const USER_ROLES = ["citizen", "moderator", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REPORT_CATEGORIES = [
  "pothole",
  "irregular_patch",
  "unpaved_road",
  "flooding",
  "construction",
  "poor_signage",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_STATUSES = [
  "pending",
  "under_review",
  "confirmed",
  "resolved",
  "archived",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;
export type ReportSeverity = (typeof REPORT_SEVERITIES)[number];

export const MODERATION_ACTIONS = [
  "approve",
  "reject",
  "resolve",
  "archive",
  "reopen",
] as const;
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

export const DEFAULT_USER_ROLE: UserRole = "citizen";
export const DEFAULT_REPORT_STATUS: ReportStatus = "pending";

export const REPORT_IMAGES_BUCKET = "report-images";
export const REPORT_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type ReportImageMimeType =
  (typeof REPORT_IMAGE_ALLOWED_MIME_TYPES)[number];

export const REPORT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
