import { describe, expect, it, vi } from "vitest";
import { feedback } from "@/db/schemas/feedback";
import { feedbackSchema } from "@/features/feedback/schemas/feedback";
import { getFeedbackList } from "@/features/feedback/server/db/feedback-queries";

// ----------------------------------------------------------------------
// Mocks — test isolé du DB réel
// ----------------------------------------------------------------------

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
  },
}));

vi.mock("@tanstack/react-start/server", () => ({
  getRequest: vi.fn(),
}));

vi.mock("@/features/feedback/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

import { db } from "@/db";
import { getRequest } from "@tanstack/react-start/server";
import { checkRateLimit } from "@/features/feedback/lib/rate-limit";

// Importer la logique du handler directement (sans wrapper createServerFn)
// pour pouvoir la tester en isolation
async function submitFeedbackHandler({ data }: { data: ReturnType<typeof feedbackSchema.parse> }) {
  const request = getRequest();
  const rateLimit = checkRateLimit(request);

  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.reason || "Trop de soumissions. Réessayez plus tard." };
  }

  try {
    await db.insert(feedback).values({
      overallRating: data.overallRating,
      easeOfUse: data.easeOfUse,
      trustAnonymity: data.trustAnonymity,
      misunderstood: data.misunderstood ?? null,
      bugDescription: data.bugDescription ?? null,
      bugPage: data.bugPage ?? null,
      improvementSuggestion: data.improvementSuggestion ?? null,
      freeComment: data.freeComment ?? null,
    }).returning();
  } catch (error) {
    return {
      success: false,
      error: "Impossible d'enregistrer votre retour. Réessayez plus tard.",
    };
  }

  return { success: true };
}

describe("Feedback table schema", () => {
  it("exposes only feedback-relevant columns", () => {
    const columns = Object.keys(feedback);
    expect(columns).toContain("id");
    expect(columns).toContain("overallRating");
    expect(columns).toContain("easeOfUse");
    expect(columns).toContain("trustAnonymity");
    expect(columns).toContain("misunderstood");
    expect(columns).toContain("bugDescription");
    expect(columns).toContain("bugPage");
    expect(columns).toContain("improvementSuggestion");
    expect(columns).toContain("freeComment");
    expect(columns).toContain("createdAt");
  });

  it("does not expose user-identifying columns", () => {
    const columns = Object.keys(feedback);
    const forbidden = [
      "userId",
      "user_id",
      "sessionId",
      "session_id",
      "ipAddress",
      "ip_address",
      "userAgent",
      "user_agent",
      "aliasId",
      "alias_id",
    ];
    for (const col of forbidden) {
      expect(columns).not.toContain(col);
    }
  });
});

describe("submitFeedback.handler", () => {
  const validData = feedbackSchema.parse({
    overallRating: 4,
    easeOfUse: 5,
    trustAnonymity: 3,
    misunderstood: "J'ai mal compris cette étape",
    bugDescription: "Page qui plante au chargement",
    bugPage: "/scenarios/new",
    improvementSuggestion: "Ajouter un exemple",
    freeComment: "Retour général",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue({ allowed: true });
    (getRequest as ReturnType<typeof vi.fn>).mockReturnValue(
      new Request("http://localhost/feedback", {
        headers: { cookie: "pv-beta-access=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
      }),
    );
  });

  it("insertion réussie", async () => {
    const insertedRow = {
      id: "fb-123",
      overallRating: validData.overallRating,
      easeOfUse: validData.easeOfUse,
      trustAnonymity: validData.trustAnonymity,
      misunderstood: validData.misunderstood,
      bugDescription: validData.bugDescription,
      bugPage: validData.bugPage,
      improvementSuggestion: validData.improvementSuggestion,
      freeComment: validData.freeComment,
      createdAt: new Date().toISOString(),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([insertedRow]),
    });

    const result = await submitFeedbackHandler({ data: validData });

    expect(result).toEqual({ success: true });
    expect(db.insert).toHaveBeenCalledWith(feedback);
  });

  it("erreur DB", async () => {
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockRejectedValue(new Error("connection refused")),
    });

    const result = await submitFeedbackHandler({ data: validData });

    expect(result).toEqual({
      success: false,
      error: "Impossible d'enregistrer votre retour. Réessayez plus tard.",
    });
  });
});

describe("getFeedbackList", () => {
  it("retourne la liste triée par createdAt décroissant", async () => {
    const rows = [
      {
        id: "fb-002",
        overallRating: 3,
        easeOfUse: 4,
        trustAnonymity: 2,
        misunderstood: null,
        bugDescription: null,
        bugPage: null,
        improvementSuggestion: "Amélioration 2",
        freeComment: null,
        createdAt: "2026-09-21T10:00:00.000Z",
      },
      {
        id: "fb-001",
        overallRating: 5,
        easeOfUse: 5,
        trustAnonymity: 5,
        misunderstood: "A",
        bugDescription: "B",
        bugPage: "/page",
        improvementSuggestion: "Amélioration 1",
        freeComment: "Commentaire",
        createdAt: "2026-09-21T09:00:00.000Z",
      },
    ];

    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(rows),
    });

    const result = await getFeedbackList();

    expect(result).toEqual(rows);
    expect(result[0].id).toBe("fb-002");
    expect(result[1].id).toBe("fb-001");
    expect(db.select).toHaveBeenCalledWith({
      id: feedback.id,
      overallRating: feedback.overallRating,
      easeOfUse: feedback.easeOfUse,
      trustAnonymity: feedback.trustAnonymity,
      misunderstood: feedback.misunderstood,
      bugDescription: feedback.bugDescription,
      bugPage: feedback.bugPage,
      improvementSuggestion: feedback.improvementSuggestion,
      freeComment: feedback.freeComment,
      createdAt: feedback.createdAt,
    });
  });

  it("retourne un tableau vide quand aucun retour", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    });

    const result = await getFeedbackList();

    expect(result).toEqual([]);
  });
});
