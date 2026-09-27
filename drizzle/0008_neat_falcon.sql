CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"overallRating" smallint NOT NULL,
	"easeOfUse" smallint NOT NULL,
	"trustAnonymity" smallint NOT NULL,
	"misunderstood" text,
	"bugDescription" text,
	"bugPage" varchar,
	"improvementSuggestion" text,
	"freeComment" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("createdAt" timestamptz_ops);