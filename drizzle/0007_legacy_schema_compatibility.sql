DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'alias' AND column_name = 'createdAt') THEN
    ALTER TABLE "alias" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blocked_users' AND column_name = 'createdAt') THEN
    ALTER TABLE "blocked_users" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'moderation_logs' AND column_name = 'createdAt') THEN
    ALTER TABLE "moderation_logs" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reports' AND column_name = 'targetType') THEN
    ALTER TABLE "reports" RENAME COLUMN "targetType" TO "target_type";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reports' AND column_name = 'createdAt') THEN
    ALTER TABLE "reports" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'targetType') THEN
    ALTER TABLE "notifications" RENAME COLUMN "targetType" TO "notifications_type";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'createdAt') THEN
    ALTER TABLE "notifications" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'createdAt') THEN
    ALTER TABLE "comments" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'updatedAt') THEN
    ALTER TABLE "comments" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'createdAt') THEN
    ALTER TABLE "posts" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'updatedAt') THEN
    ALTER TABLE "posts" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'threads' AND column_name = 'createdAt') THEN
    ALTER TABLE "threads" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'threads' AND column_name = 'updatedAt') THEN
    ALTER TABLE "threads" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'createdAt') THEN
    ALTER TABLE "account" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'updatedAt') THEN
    ALTER TABLE "account" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'createdAt') THEN
    ALTER TABLE "session" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'updatedAt') THEN
    ALTER TABLE "session" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'createdAt') THEN
    ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'updatedAt') THEN
    ALTER TABLE "user" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'verification' AND column_name = 'createdAt') THEN
    ALTER TABLE "verification" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'verification' AND column_name = 'updatedAt') THEN
    ALTER TABLE "verification" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;--> statement-breakpoint
DROP INDEX IF EXISTS "notifications_user_created_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "comments_post_created_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "posts_thread_created_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "threads_category_created_idx";--> statement-breakpoint
ALTER TABLE "threads" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
-- Better Auth identifies an account by the provider/account pair. Refuse to
-- choose between two different users: that conflict needs manual review rather
-- than silently transferring credentials from one participant to another.
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "account"
		GROUP BY "provider_id", "account_id"
		HAVING count(DISTINCT "user_id") > 1
	) THEN
		RAISE EXCEPTION 'Cannot enforce account_provider_account_unique: a provider/account pair belongs to multiple users';
	END IF;
END
$$;--> statement-breakpoint
-- Raced account creation can still leave equivalent rows for the same user.
-- Keep the oldest row, with the primary key as a deterministic tie-breaker.
WITH "ranked_accounts" AS (
	SELECT
		"id",
		row_number() OVER (
			PARTITION BY "provider_id", "account_id"
			ORDER BY "created_at", "id"
		) AS "duplicate_rank"
	FROM "account"
)
DELETE FROM "account"
USING "ranked_accounts"
WHERE "account"."id" = "ranked_accounts"."id"
	AND "ranked_accounts"."duplicate_rank" > 1;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_account_unique" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_post_created_idx" ON "comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_thread_created_idx" ON "posts" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "threads_category_created_idx" ON "threads" USING btree ("category","created_at" DESC NULLS LAST);