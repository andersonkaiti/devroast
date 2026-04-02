CREATE TYPE "public"."roast_mode" AS ENUM('honest', 'roast');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TABLE "analysis_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"severity" "severity" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"code_preview" varchar(160) NOT NULL,
	"lang" text NOT NULL,
	"roast_mode" "roast_mode" NOT NULL,
	"score" numeric(3, 1) NOT NULL,
	"roast_text" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_findings" ADD CONSTRAINT "analysis_findings_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analysis_findings_submission_id_sort_order" ON "analysis_findings" USING btree ("submission_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_submissions_score" ON "submissions" USING btree ("score");--> statement-breakpoint
CREATE INDEX "idx_submissions_created_at" ON "submissions" USING btree ("created_at");