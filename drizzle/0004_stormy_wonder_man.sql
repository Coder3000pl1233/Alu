CREATE TYPE "public"."listing_status" AS ENUM('draft', 'pending', 'published', 'rejected', 'paused', 'hidden', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('note', 'guide', 'mock_exam', 'summary');--> statement-breakpoint
CREATE TYPE "public"."moderation_decision" AS ENUM('approved', 'rejected', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('inappropriate', 'copyright', 'misleading', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."sample_status" AS ENUM('uploading', 'processing', 'ready', 'failed');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'seller' BEFORE 'admin';--> statement-breakpoint
CREATE TABLE "listing_moderation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"decision" "moderation_decision" NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"reporter_id" uuid,
	"reason" "report_reason" NOT NULL,
	"description" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"resolved_by" uuid,
	"resolution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "listing_sample_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sample_id" uuid NOT NULL,
	"page_number" integer NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" varchar(80) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	CONSTRAINT "listing_sample_pages_range" CHECK ("listing_sample_pages"."page_number" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "listing_samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"status" "sample_status" DEFAULT 'uploading' NOT NULL,
	"original_key" text,
	"original_bytes" integer,
	"original_sha256" varchar(64),
	"page_count" integer,
	"safe_failure_code" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"subject_id" uuid,
	"university_id" uuid,
	"title" varchar(160) NOT NULL,
	"description" text,
	"type" "listing_type",
	"price_ars" integer,
	"full_page_count" integer,
	"whatsapp_number" varchar(32),
	"contact_consent" boolean DEFAULT false NOT NULL,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"submitted_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listings_price_nonnegative" CHECK ("listings"."price_ars" IS NULL OR "listings"."price_ars" >= 0),
	CONSTRAINT "listings_page_count_positive" CHECK ("listings"."full_page_count" IS NULL OR "listings"."full_page_count" > 0)
);
--> statement-breakpoint
CREATE TABLE "marketplace_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(160) NOT NULL,
	CONSTRAINT "marketplace_subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "marketplace_universities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(160) NOT NULL,
	CONSTRAINT "marketplace_universities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "listing_moderation_events" ADD CONSTRAINT "listing_moderation_events_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_moderation_events" ADD CONSTRAINT "listing_moderation_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_sample_pages" ADD CONSTRAINT "listing_sample_pages_sample_id_listing_samples_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."listing_samples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_samples" ADD CONSTRAINT "listing_samples_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_subject_id_marketplace_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."marketplace_subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_university_id_marketplace_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."marketplace_universities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_moderation_listing_time_idx" ON "listing_moderation_events" USING btree ("listing_id","created_at");--> statement-breakpoint
CREATE INDEX "listing_reports_status_time_idx" ON "listing_reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "listing_reports_listing_idx" ON "listing_reports" USING btree ("listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_sample_pages_number_unique" ON "listing_sample_pages" USING btree ("sample_id","page_number");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_sample_pages_storage_key_unique" ON "listing_sample_pages" USING btree ("storage_key");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_samples_revision_unique" ON "listing_samples" USING btree ("listing_id","revision");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_samples_original_key_unique" ON "listing_samples" USING btree ("original_key");--> statement-breakpoint
CREATE INDEX "listing_samples_listing_status_idx" ON "listing_samples" USING btree ("listing_id","status");--> statement-breakpoint
CREATE INDEX "listings_public_idx" ON "listings" USING btree ("status","published_at","id");--> statement-breakpoint
CREATE INDEX "listings_seller_idx" ON "listings" USING btree ("seller_id","updated_at");