CREATE TYPE "public"."document_status" AS ENUM('quarantined', 'queued', 'processing', 'ready', 'failed', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('note', 'guide', 'book', 'mock_exam');--> statement-breakpoint
CREATE TYPE "public"."page_variant" AS ENUM('master', 'normal', 'high');--> statement-breakpoint
CREATE TYPE "public"."processing_job_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "document_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"page_number" integer NOT NULL,
	"variant" "page_variant" NOT NULL,
	"storage_key" text NOT NULL,
	"sha256" varchar(64) NOT NULL,
	"byte_size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(160) NOT NULL,
	"subject_id" varchar(80) NOT NULL,
	"type" "document_type" NOT NULL,
	"status" "document_status" DEFAULT 'quarantined' NOT NULL,
	"original_key" text NOT NULL,
	"original_sha256" varchar(64) NOT NULL,
	"original_bytes" integer NOT NULL,
	"original_mime" varchar(100) NOT NULL,
	"page_count" integer,
	"processing_progress" integer DEFAULT 0 NOT NULL,
	"safe_failure_code" varchar(80),
	"published_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"status" "processing_job_status" DEFAULT 'queued' NOT NULL,
	"attempt" integer DEFAULT 0 NOT NULL,
	"safe_failure_code" varchar(80),
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_pages" ADD CONSTRAINT "document_pages_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "document_pages_variant_unique" ON "document_pages" USING btree ("document_id","page_number","variant");--> statement-breakpoint
CREATE UNIQUE INDEX "document_pages_storage_key_unique" ON "document_pages" USING btree ("storage_key");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_original_key_unique" ON "documents" USING btree ("original_key");--> statement-breakpoint
CREATE INDEX "documents_catalog_idx" ON "documents" USING btree ("status","subject_id","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "processing_jobs_idempotency_unique" ON "processing_jobs" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "processing_jobs_document_status_idx" ON "processing_jobs" USING btree ("document_id","status");