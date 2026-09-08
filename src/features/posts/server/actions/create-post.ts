import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
export const createPostFn = createServerFn({method: "POST"}).inputValidator(z.object({threadId:z.string(),content:z.string(),isSensitive:z.boolean().optional(),contentWarnings:z.array(z.string()).optional()})).handler(async (): Promise<{ success: true; post: never }> => { throw new Error("Les réponses sont fermées pendant la bêta privée."); });
