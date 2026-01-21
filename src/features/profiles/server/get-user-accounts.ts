import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/features/auth/lib/auth";

export const getUserAccounts = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest();
    const accounts = await auth.api.listUserAccounts({
      headers: request.headers,
    });
    return accounts;
  },
);
