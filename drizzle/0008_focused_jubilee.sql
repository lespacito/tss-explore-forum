-- Migration: add feedback table for anonymous beta feedback
-- Created: 2026-09-18

CREATE TABLE IF NOT EXISTS "feedback" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "overallRating" smallint NOT NULL,
    "easeOfUse" smallint NOT NULL,
    "trustAnonymity" smallint NOT NULL,
    "misunderstood" text,
    "bugDescription" text,
    "bugPage" varchar,
    "improvementSuggestion" text,
    "freeComment" text,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "feedback_created_at_idx" ON "feedback" USING btree ("createdAt" DESC NULLS LAST);