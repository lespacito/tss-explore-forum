import { db } from "../src/db";
import { user } from "../src/db/schemas/user";
import { alias } from "../src/db/schemas/alias";
import { threads } from "../src/db/schemas/thread";
import { eq } from "drizzle-orm";

/**
 * Script de diagnostic pour debugger le flow de première publication
 *
 * Usage:
 *   tsx scripts/debug-user-threads.ts <aliasId>
 *
 * Exemple:
 *   tsx scripts/debug-user-threads.ts 25e72ce2-8c22-476c-a7cf-636520e779b6
 */

async function debugUserThreads(aliasId: string) {
  console.log("\n🔍 === DIAGNOSTIC USER & THREADS ===\n");

  // 1. Récupérer l'alias
  const [userAlias] = await db
    .select()
    .from(alias)
    .where(eq(alias.id, aliasId))
    .limit(1);

  if (!userAlias) {
    console.error("❌ Alias introuvable:", aliasId);
    process.exit(1);
  }

  console.log("✅ Alias trouvé:");
  console.log("  - ID:", userAlias.id);
  console.log("  - Name:", userAlias.aliasName);
  console.log("  - User ID:", userAlias.userId);
  console.log("  - Is Primary:", userAlias.isPrimary);
  console.log();

  // 2. Récupérer l'utilisateur
  const [currentUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userAlias.userId))
    .limit(1);

  if (!currentUser) {
    console.error("❌ Utilisateur introuvable:", userAlias.userId);
    process.exit(1);
  }

  console.log("👤 Utilisateur:");
  console.log("  - ID:", currentUser.id);
  console.log("  - Name:", currentUser.name);
  console.log("  - Email:", currentUser.email || "NULL (anonyme)");
  console.log("  - Is Anonymous:", currentUser.isAnonymous);
  console.log("  - Secret Code:", currentUser.secretCode || "NULL (pas encore généré)");
  console.log("  - Code Generated At:", currentUser.secretCodeGeneratedAt || "NULL");
  console.log();

  // 3. Compter les threads de cet alias
  const userThreads = await db
    .select()
    .from(threads)
    .where(eq(threads.aliasId, aliasId));

  console.log("📝 Threads de cet alias:");
  console.log("  - Total:", userThreads.length);
  console.log();

  if (userThreads.length > 0) {
    console.log("  Liste des threads:");
    userThreads.forEach((thread, index) => {
      console.log(`    ${index + 1}. "${thread.title}" (${thread.slug})`);
      console.log(`       Créé le: ${thread.createdAt}`);
    });
    console.log();
  }

  // 4. Analyse
  console.log("🎯 === ANALYSE ===\n");

  const isAnonymous = currentUser.email === null;
  const isFirstThread = userThreads.length === 1; // 1 parce que le thread vient d'être créé
  const hasSecretCode = currentUser.secretCode !== null;

  if (!isAnonymous) {
    console.log("❌ PROBLÈME: Utilisateur n'est PAS anonyme");
    console.log("   → email n'est pas NULL");
    console.log("   → Le système ne génère pas de code pour les utilisateurs enregistrés");
    console.log();
  } else {
    console.log("✅ Utilisateur est anonyme (email = NULL)");
  }

  if (!isFirstThread) {
    console.log("❌ PROBLÈME: Ce n'est PAS le premier thread");
    console.log(`   → ${userThreads.length} threads trouvés pour cet alias`);
    console.log("   → Le code secret est généré UNIQUEMENT au premier thread");
    console.log();
  } else {
    console.log("✅ C'est le premier thread de cet utilisateur");
  }

  if (isAnonymous && isFirstThread && !hasSecretCode) {
    console.log("🚨 PROBLÈME CRITIQUE:");
    console.log("   → Utilisateur anonyme ✅");
    console.log("   → Premier thread ✅");
    console.log("   → MAIS pas de secret code ❌");
    console.log();
    console.log("💡 Causes possibles:");
    console.log("   1. generateSecretCodeLogic() a échoué");
    console.log("   2. Erreur non catchée dans createThreadFn");
    console.log("   3. Bug dans la condition isFirstPublication");
    console.log();
    console.log("🔧 Solutions:");
    console.log("   1. Vérifier les logs serveur pour 'Secret code generation failed'");
    console.log("   2. Ajouter plus de logs dans createThreadFn");
    console.log("   3. Tester generateSecretCodeLogic isolément");
  }

  if (isAnonymous && isFirstThread && hasSecretCode) {
    console.log("✅ TOUT EST OK:");
    console.log("   → Code secret généré avec succès");
    console.log(`   → Code: ${currentUser.secretCode}`);
    console.log();
    console.log("⚠️ Mais le frontend n'a pas reçu le code dans la réponse");
    console.log("   → Vérifier que createThreadFn retourne bien le code");
    console.log("   → Vérifier les logs serveur");
  }

  if (!isAnonymous || !isFirstThread) {
    console.log("✅ Comportement NORMAL:");
    console.log("   → Le système ne génère pas de code dans ce cas");
    console.log();
    if (!isAnonymous) {
      console.log("   Raison: Utilisateur enregistré (a un email)");
    }
    if (!isFirstThread) {
      console.log("   Raison: Ce n'est pas le premier thread");
    }
  }

  console.log("\n=== FIN DU DIAGNOSTIC ===\n");
}

// Point d'entrée
const aliasId = process.argv[2];

if (!aliasId) {
  console.error("❌ Usage: tsx scripts/debug-user-threads.ts <aliasId>");
  console.error("\nExemple:");
  console.error("  tsx scripts/debug-user-threads.ts 25e72ce2-8c22-476c-a7cf-636520e779b6");
  process.exit(1);
}

debugUserThreads(aliasId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });
