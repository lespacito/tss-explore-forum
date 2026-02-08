import { generateAlias } from "./generate-alias";
import {
	createAliasRecord,
	findAliasByName,
	isAliasNameAvailable,
} from "../server/db/alias-queries";

/**
 * Crée un alias principal pour un utilisateur lors de l'inscription
 *
 * @param userId - L'identifiant de l'utilisateur
 * @returns Le nouvel alias créé
 * @throws Error si impossible de générer un alias unique après plusieurs tentatives
 *
 * @example
 * ```typescript
 * const newAlias = await createPrimaryAlias("user_123");
 * console.log(`Alias créé: ${newAlias.alias}`);
 * ```
 */
export async function createPrimaryAlias(userId: string) {
	let aliasName = generateAlias();
	let attempts = 0;
	const maxAttempts = 10;

	// Boucle pour éviter les doublons
	while (attempts < maxAttempts) {
		const existing = await findAliasByName(aliasName);

		if (!existing) {
			break;
		}

		aliasName = generateAlias();
		attempts++;
	}

	if (attempts >= maxAttempts) {
		throw new Error(
			"Impossible de générer un alias unique après plusieurs tentatives",
		);
	}

	return await createAliasRecord({
		userId,
		alias: aliasName,
		isPrimary: true,
		rotationEnabled: false,
	});
}

/**
 * Crée un alias secondaire pour un utilisateur
 *
 * @param userId - L'identifiant de l'utilisateur
 * @param customAlias - (Optionnel) Nom d'alias personnalisé
 * @param rotationEnabled - (Optionnel) Active la rotation automatique
 * @returns Le nouvel alias créé
 * @throws Error si impossible de générer un alias unique ou si l'alias personnalisé existe déjà
 *
 * @example
 * ```typescript
 * // Générer un alias aléatoire
 * const randomAlias = await createSecondaryAlias("user_123");
 *
 * // Créer un alias personnalisé
 * const customAlias = await createSecondaryAlias("user_123", "MonPseudo-2024");
 * ```
 */
export async function createSecondaryAlias(
	userId: string,
	customAlias?: string,
	rotationEnabled = false,
) {
	let aliasName: string;

	if (customAlias) {
		// Vérifier si l'alias personnalisé existe déjà
		const existing = await findAliasByName(customAlias);

		if (existing) {
			throw new Error(`L'alias "${customAlias}" est déjà utilisé`);
		}

		aliasName = customAlias;
	} else {
		// Générer un alias aléatoire unique
		aliasName = generateAlias();
		let attempts = 0;
		const maxAttempts = 10;

		while (attempts < maxAttempts) {
			const existing = await findAliasByName(aliasName);

			if (!existing) {
				break;
			}

			aliasName = generateAlias();
			attempts++;
		}

		if (attempts >= maxAttempts) {
			throw new Error(
				"Impossible de générer un alias unique après plusieurs tentatives",
			);
		}
	}

	return await createAliasRecord({
		userId,
		alias: aliasName,
		isPrimary: false,
		rotationEnabled,
	});
}

/**
 * Vérifie si un nom d'alias est disponible
 *
 * @param aliasName - Le nom d'alias à vérifier
 * @returns true si l'alias est disponible, false sinon
 *
 * @example
 * ```typescript
 * const isAvailable = await isAliasAvailable("MonPseudo-2024");
 * if (isAvailable) {
 *   console.log("Cet alias est disponible !");
 * }
 * ```
 */
export async function isAliasAvailable(aliasName: string): Promise<boolean> {
	return await isAliasNameAvailable(aliasName);
}
