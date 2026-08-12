DO $$ BEGIN
 CREATE TYPE "public"."thread_status" AS ENUM('pending', 'published', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "status" "thread_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "is_sensitive" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "moderated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "moderator_id" text;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "threads_status_idx" ON "threads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "threads_moderator_idx" ON "threads" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "threads_deleted_at_idx" ON "threads" USING btree ("deleted_at");