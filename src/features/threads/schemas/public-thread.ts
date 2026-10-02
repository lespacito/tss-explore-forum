export type PublicThread = {
	id: string;
	title: string;
	body: string;
	slug: string;
	category: string | null;
	isSensitive: boolean;
	createdAt: string;
	updatedAt: string;
};

type PublicThreadSource = Omit<PublicThread, "createdAt" | "updatedAt"> & {
	createdAt: Date | string;
	updatedAt: Date | string;
};

/** Allowlist at the public boundary: never spread database rows into responses. */
export function toPublicThread(thread: PublicThreadSource): PublicThread {
	return {
		id: thread.id,
		title: thread.title,
		body: thread.body,
		slug: thread.slug,
		category: thread.category,
		isSensitive: thread.isSensitive,
		createdAt: thread.createdAt instanceof Date ? thread.createdAt.toISOString() : thread.createdAt,
		updatedAt: thread.updatedAt instanceof Date ? thread.updatedAt.toISOString() : thread.updatedAt,
	};
}
