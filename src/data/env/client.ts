import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_APP_NAME: z.string().min(1),
		VITE_APP_URL: z.string().min(1),
		VITE_BETTER_AUTH_URL: z.string().min(1).optional(),
	},
	emptyStringAsUndefined: true,
	runtimeEnv: import.meta.env,
});
