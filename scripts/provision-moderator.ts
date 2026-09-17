/**
 * Provisionnement interactif d'un rôle sur un compte existant.
 *
 * Contraintes opérationnelles :
 * - Exécution uniquement interactive avec TTY ; CI/CD et non-TTY refusés.
 * - Ordre strict : TTY → email → rôle → validation → confirmation yes →
 *   getUserByEmail → vérification → setUserRole.
 * - Aucune lecture ni écriture DB avant validation du rôle et confirmation
 *   humaine.
 * - Rôle absent / entrée vide au prompt → MODERATOR par défaut.
 * - Seules les chaînes exactes MODERATOR et ADMIN sont acceptées ; toute
 *   variante de casse, espace ou valeur différente est rejetée (pas de trim).
 * - Utilise getUserByEmail + setUserRole depuis ./db (DB_* uniquement).
 *
 * Ce fichier est un script d'administration à usage manuel ; il ne doit jamais
 * être invoqué automatiquement par une pipeline CI/CD.
 */

import { getUserByEmail, setUserRole, closeDatabase } from "./db";
import * as readline from "node:readline/promises";

export const ACCEPTED_ROLES = ["MODERATOR", "ADMIN"] as const;
export type AcceptedRole = (typeof ACCEPTED_ROLES)[number];

export const DEFAULT_ROLE = "MODERATOR" as const;

// ----------------------------------------------------------------------
// Sécurité d'exécution : refus en environnement non interactif
// ----------------------------------------------------------------------

export function requireInteractiveEnvironment(): void {
  if (!process.stdin.isTTY) {
    console.error(
      "Ce script est réservé à une exécution interactive manuelle (TTY requis).",
    );
    process.exit(2);
  }
}

// ----------------------------------------------------------------------
// Validation en entrée — sans trim, comparaison stricte
// ----------------------------------------------------------------------

export function validateRoleInput(raw: string): AcceptedRole {
  if (raw !== "MODERATOR" && raw !== "ADMIN") {
    console.error(
      `Rôle invalide : ${raw}. Seules les chaînes exactes MODERATOR et ADMIN sont autorisées.`,
    );
    process.exit(1);
  }
  return raw as AcceptedRole;
}

// ----------------------------------------------------------------------
// Orchestre interactif
// ----------------------------------------------------------------------

export async function main(): Promise<void> {
  requireInteractiveEnvironment();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // 1. Saisie email
    const email = (await rl.question("Entrez l'adresse email du compte à provisionner : ")).trim();
    if (!email) {
      console.error("Adresse email manquante.");
      process.exit(1);
    }

    // 2. Saisie rôle (avant confirmation et avant DB)
    const roleInput = (await rl.question("Rôle à attribuer (MODERATOR ou ADMIN, défaut : MODERATOR) : "));
    const desiredRole = roleInput === "" ? DEFAULT_ROLE : validateRoleInput(roleInput);

    // 3. Confirmation (avant toute DB)
    const confirmed = (await rl.question(`Confirmer l'attribution du rôle ${desiredRole} à ${email} ? (yes / no)`)).trim().toLowerCase();
    if (confirmed !== "yes") {
      console.error("Confirmation refusée ; aucune mutation appliquée.");
      process.exit(3);
    }

    // 4. Lecture DB uniquement après confirmation
    const existing = await getUserByEmail(email);
    if (!existing) {
      console.error(`Aucun compte trouvé pour l'adresse ${email}.`);
      process.exit(1);
    }

    // 5. Vérification du rôle actuel
    const currentRole = existing.role ?? "USER";
    if (desiredRole === currentRole) {
      console.error(`Le compte possède déjà le rôle ${currentRole} ; aucune mutation nécessaire.`);
      process.exit(0);
    }

    // 6. Mutation uniquement si nécessaire et après tous les guardes-fous
    await setUserRole(existing.id, desiredRole);
    console.log(`Rôle ${desiredRole} attribué avec succès au compte ${email}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Échec de la provisioning : ${message}`);
    process.exit(1);
  } finally {
    rl.close();
    await closeDatabase();
  }
}

// Lancement CLI uniquement si ce module est exécuté directement (pas importé par les tests)
if (import.meta.main) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Erreur inattendue : ${message}`);
    process.exit(1);
  });
}
