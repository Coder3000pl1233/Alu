import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["student", "admin"]);
export const userStatus = pgEnum("user_status", ["active", "suspended", "revoked"]);
export const deviceStatus = pgEnum("device_status", ["active", "revoked"]);
export const documentStatus = pgEnum("document_status", ["quarantined", "queued", "processing", "ready", "failed", "rejected", "archived"]);
export const documentType = pgEnum("document_type", ["note", "guide", "book", "mock_exam"]);
export const processingJobStatus = pgEnum("processing_job_status", ["queued", "processing", "completed", "failed"]);
export const pageVariant = pgEnum("page_variant", ["master", "normal", "high"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  role: userRole("role").notNull().default("student"),
  status: userStatus("status").notNull().default("active"),
  accessUntil: timestamp("access_until", { withTimezone: true, mode: "date" }),
  passwordHash: text("password_hash").notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  sessionVersion: integer("session_version").notNull().default(1),
  suspendedAt: timestamp("suspended_at", { withTimezone: true, mode: "date" }),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("users_email_lower_unique").on(sql`lower(${table.email})`),
  index("users_status_access_until_idx").on(table.status, table.accessUntil),
]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  identifierHash: varchar("identifier_hash", { length: 64 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  status: deviceStatus("status").notNull().default("active"),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
}, (table) => [
  uniqueIndex("devices_user_identifier_unique").on(table.userId, table.identifierHash),
  index("devices_user_status_idx").on(table.userId, table.status),
]);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: uuid("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  userSessionVersion: integer("user_session_version").notNull(),
  idleExpiresAt: timestamp("idle_expires_at", { withTimezone: true, mode: "date" }).notNull(),
  absoluteExpiresAt: timestamp("absolute_expires_at", { withTimezone: true, mode: "date" }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  revocationReason: varchar("revocation_reason", { length: 80 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
  index("sessions_user_active_idx").on(table.userId, table.revokedAt, table.absoluteExpiresAt),
  index("sessions_device_idx").on(table.deviceId, table.revokedAt),
]);

export type Device = typeof devices.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export const loginAttempts = pgTable("login_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectHash: varchar("subject_hash", { length: 64 }).notNull(),
  ipHash: varchar("ip_hash", { length: 64 }).notNull(),
  succeeded: boolean("succeeded").notNull(),
  attemptedAt: timestamp("attempted_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  index("login_attempts_subject_time_idx").on(table.subjectHash, table.attemptedAt),
  index("login_attempts_ip_time_idx").on(table.ipHash, table.attemptedAt),
]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 80 }).notNull(),
  objectType: varchar("object_type", { length: 80 }).notNull(),
  objectId: varchar("object_id", { length: 128 }),
  result: varchar("result", { length: 32 }).notNull(),
  requestId: uuid("request_id").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  index("audit_events_actor_time_idx").on(table.actorId, table.createdAt),
  index("audit_events_object_time_idx").on(table.objectType, table.objectId, table.createdAt),
  index("audit_events_request_id_idx").on(table.requestId),
]);

export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 160 }).notNull(),
  subjectId: varchar("subject_id", { length: 80 }).notNull(),
  type: documentType("type").notNull(),
  status: documentStatus("status").notNull().default("quarantined"),
  originalKey: text("original_key").notNull(),
  originalSha256: varchar("original_sha256", { length: 64 }).notNull(),
  originalBytes: integer("original_bytes").notNull(),
  originalMime: varchar("original_mime", { length: 100 }).notNull(),
  pageCount: integer("page_count"),
  processingProgress: integer("processing_progress").notNull().default(0),
  safeFailureCode: varchar("safe_failure_code", { length: 80 }),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("documents_original_key_unique").on(table.originalKey),
  index("documents_catalog_idx").on(table.status, table.subjectId, table.publishedAt),
]);

export const processingJobs = pgTable("processing_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  idempotencyKey: uuid("idempotency_key").notNull(),
  status: processingJobStatus("status").notNull().default("queued"),
  attempt: integer("attempt").notNull().default(0),
  safeFailureCode: varchar("safe_failure_code", { length: 80 }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("processing_jobs_idempotency_unique").on(table.idempotencyKey),
  index("processing_jobs_document_status_idx").on(table.documentId, table.status),
]);

export const documentPages = pgTable("document_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  pageNumber: integer("page_number").notNull(),
  variant: pageVariant("variant").notNull(),
  storageKey: text("storage_key").notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  byteSize: integer("byte_size").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("document_pages_variant_unique").on(table.documentId, table.pageNumber, table.variant),
  uniqueIndex("document_pages_storage_key_unique").on(table.storageKey),
]);

export type Document = typeof documents.$inferSelect;
export type ProcessingJob = typeof processingJobs.$inferSelect;
export type DocumentPage = typeof documentPages.$inferSelect;
