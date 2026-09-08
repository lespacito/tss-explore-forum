/**
 * E2E Test Database Seed Script
 *
 * Populates the test database with sample data for E2E tests:
 * - Test users (anonymous and registered)
 * - Aliases
 * - Published threads (for Story 3.1 tests)
 * - Pending/rejected threads (to verify filters)
 */

import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";
import { threads } from "@/db/schemas/thread";
import { user } from "@/db/schemas/user";
import { generateSecretCode } from "@/features/auth/lib/generate-secret-code";

const SEED_DATA = {
	users: [
		{
			displayUsername: "brave-phoenix",
			isAnonymous: true,
			secretCode: null as string | null, // Will be generated in seed()
		},
		{
			displayUsername: "silent-owl",
			isAnonymous: true,
			secretCode: null as string | null, // Will be generated in seed()
		},
	],
	threads: [
		{
			title: "Comment parler de violence conjugale à mes proches ?",
			body: "<p>Je suis victime de violence conjugale depuis plusieurs mois. J'aimerais en parler à ma famille mais je ne sais pas comment aborder le sujet. Avez-vous des conseils ?</p>",
			category: "VIOLENCE",
			status: "published" as const,
		},
		{
			title: "Ressources pour les victimes d'abus psychologique",
			body: "<p>Je cherche des ressources fiables sur l'abus psychologique. Connaissez-vous des associations qui peuvent m'aider ?</p><ul><li>Numéros d'urgence</li><li>Associations locales</li><li>Groupes de soutien</li></ul>",
			category: "ABUS",
			status: "published" as const,
		},
		{
			title: "Témoignage : J'ai été témoin de harcèlement au travail",
			body: "<p>Récemment, j'ai été témoin de harcèlement moral envers une collègue. Je ne savais pas comment réagir sur le moment, mais j'aimerais l'aider maintenant.</p>",
			category: "TEMOIN",
			status: "published" as const,
		},
		{
			title: "Anxiété et détresse : Comment gérer au quotidien ?",
			body: "<p>Je traverse une période difficile et je ressens beaucoup d'anxiété. Quelles sont vos stratégies pour gérer la détresse au quotidien ?</p><h2>Mes symptômes</h2><p>Troubles du sommeil, crises d'angoisse fréquentes, difficultés de concentration.</p>",
			category: "DETRESSE",
			status: "published" as const,
		},
		{
			title: "Question sur les démarches juridiques après une agression",
			body: "<p>Suite à une agression, je souhaite porter plainte mais je ne connais pas bien les démarches. Quelqu'un peut-il m'éclairer sur la procédure ?</p>",
			category: "AUTRE",
			status: "published" as const,
		},
		{
			title: "Soutien pour sortir d'une relation toxique",
			body: "<p>Ma relation est devenue toxique et je veux en sortir, mais j'ai peur et je me sens isolée. Comment avez-vous trouvé le courage de partir ?</p><blockquote>Le plus difficile est de faire le premier pas...</blockquote>",
			category: "VIOLENCE",
			status: "published" as const,
		},
		{
			title: "Comprendre le gaslighting et ses effets",
			body: "<p>Je réalise maintenant que j'ai été victime de gaslighting pendant des années. Je cherche à comprendre ce phénomène et ses conséquences sur la santé mentale.</p><h2>Définition</h2><p>Le gaslighting est une forme de manipulation psychologique...</p>",
			category: "ABUS",
			status: "published" as const,
		},
		{
			title: "J'ai été témoin de violence domestique dans mon voisinage",
			body: "<p>J'entends régulièrement des disputes violentes chez mes voisins. Je suis inquiet mais je ne sais pas si je dois intervenir. Que faire dans cette situation ?</p>",
			category: "TEMOIN",
			status: "published" as const,
		},
		// Threads with other statuses for testing filters
		{
			title: "Thread en attente de modération (PENDING)",
			body: "<p>Ce thread devrait être invisible dans la liste publique car il est en attente de modération.</p>",
			category: "AUTRE",
			status: "pending" as const,
		},
		{
			title: "Thread rejeté (REJECTED)",
			body: "<p>Ce thread a été rejeté par la modération et ne devrait pas apparaître dans la liste publique.</p>",
			category: "AUTRE",
			status: "rejected" as const,
		},
		// Soft-deleted thread for AR7 filter verification
		{
			title: "Thread supprimé (SOFT DELETE)",
			body: "<p>Ce thread est publié mais soft-deleted, il ne devrait pas apparaître dans la liste publique (AR7).</p>",
			category: "AUTRE",
			status: "published" as const,
			deletedAt: new Date(),
		},
	],
};

async function seed() {
	console.log("🌱 Starting E2E database seed...\n");

	try {
		// 1. Create test users (both anonymous for simplicity)
		console.log("📝 Creating test users...");

		const secretCode1 = await generateSecretCode();
		const secretCode2 = await generateSecretCode();

		const [testUser1] = await db
			.insert(user)
			.values({
				id: uuidv4(),
				name: SEED_DATA.users[0].displayUsername,
				email: `${SEED_DATA.users[0].displayUsername}@seed.test`,
				emailVerified: false,
				displayUsername: SEED_DATA.users[0].displayUsername,
				isAnonymous: SEED_DATA.users[0].isAnonymous,
				secretCode: secretCode1,
				secretCodeGeneratedAt: new Date(),
			})
			.returning();

		const [testUser2] = await db
			.insert(user)
			.values({
				id: uuidv4(),
				name: SEED_DATA.users[1].displayUsername,
				email: `${SEED_DATA.users[1].displayUsername}@seed.test`,
				emailVerified: false,
				displayUsername: SEED_DATA.users[1].displayUsername,
				isAnonymous: SEED_DATA.users[1].isAnonymous,
				secretCode: secretCode2,
				secretCodeGeneratedAt: new Date(),
			})
			.returning();

		console.log(`✅ Created 2 test users (anonymous)`);
		console.log(`   - User 1: ${testUser1.displayUsername} (${secretCode1})`);
		console.log(`   - User 2: ${testUser2.displayUsername} (${secretCode2})\n`);

		// 2. Create aliases for test users
		console.log("📝 Creating aliases...");

		const [alias1] = await db
			.insert(alias)
			.values({
				userId: testUser1.id,
				alias: "brave-phoenix",
				isPrimary: true,
			})
			.returning();

		const [alias2] = await db
			.insert(alias)
			.values({
				userId: testUser2.id,
				alias: "silent-owl",
				isPrimary: true,
			})
			.returning();

		console.log(`✅ Created 2 aliases\n`);

		// 3. Create threads
		console.log("📝 Creating threads...");

		const aliasPool = [alias1.id, alias2.id];
		let publishedCount = 0;
		let pendingCount = 0;
		let rejectedCount = 0;
		let softDeletedCount = 0;

		for (const threadData of SEED_DATA.threads) {
			const randomAliasId =
				aliasPool[Math.floor(Math.random() * aliasPool.length)];

			await db.insert(threads).values({
				aliasId: randomAliasId,
				title: threadData.title,
				body: threadData.body,
				slug: slugify(threadData.title, { lower: true, strict: true }),
				category: threadData.category,
				status: threadData.status,
				isSensitive: false,
				createdAt: new Date(
					Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
				), // Random date within last 7 days
				...("deletedAt" in threadData && threadData.deletedAt
					? { deletedAt: threadData.deletedAt }
					: {}),
			});

			if ("deletedAt" in threadData && threadData.deletedAt) softDeletedCount++;
			else if (threadData.status === "published") publishedCount++;
			if (threadData.status === "pending") pendingCount++;
			if (threadData.status === "rejected") rejectedCount++;
		}

		console.log(`✅ Created ${SEED_DATA.threads.length} threads`);
		console.log(`   - Published: ${publishedCount}`);
		console.log(`   - Pending: ${pendingCount}`);
		console.log(`   - Rejected: ${rejectedCount}`);
		console.log(`   - Soft-deleted: ${softDeletedCount}\n`);

		console.log("🎉 E2E database seed completed successfully!\n");
		console.log("📊 Summary:");
		console.log(`   - Users: 2`);
		console.log(`   - Aliases: 2`);
		console.log(
			`   - Threads: ${SEED_DATA.threads.length} (${publishedCount} published)`,
		);
		console.log("\n✅ Ready for E2E tests!\n");
	} catch (error) {
		console.error("❌ Seed failed:", error);
		throw error;
	}
}

// Run seed
seed()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
