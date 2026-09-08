import { createServerFn } from "@tanstack/react-start";
export const generateSecretCodeFn = createServerFn({ method: "POST" }).handler(
	async () => {
		const { getAuthSession } = await import("./get-auth-session");
		const { generateSecretCodeLogic } = await import(
			"./generate-secret-code-logic"
		);
		return generateSecretCodeLogic(await getAuthSession());
	},
);
