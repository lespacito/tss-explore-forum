-- Older versions could create the same secret-code account twice when two
-- first submissions raced. Keep one row only when both records belong to the
-- same user; cross-user conflicts remain blocking and require manual review.
DELETE FROM "account" AS "duplicate"
USING "account" AS "keeper"
WHERE "duplicate"."provider_id" = 'secret-code'
	AND "duplicate"."provider_id" = "keeper"."provider_id"
	AND "duplicate"."account_id" = "keeper"."account_id"
	AND "duplicate"."user_id" = "keeper"."user_id"
	AND "duplicate"."id" > "keeper"."id";
--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_unique" ON "account" USING btree ("provider_id","account_id");
