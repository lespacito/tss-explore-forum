ALTER TABLE "user" ADD COLUMN "secret_code" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "secret_code_generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_secret_code_unique" UNIQUE("secret_code");