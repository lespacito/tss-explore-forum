import ActionButton from "@/components/ui/action-button";
import type { ComponentProps } from "react";
import { useState } from "react";

export function BetterAuthActionButton({
  action,
  successMessage,
  ...props
}: Omit<ComponentProps<typeof ActionButton>, "isPending" | "onClick"> & {
  action: () => Promise<{ error: null | { message?: string } }>;
  successMessage?: string;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const res = await action();
      if (res.error) {
        return { error: true, message: res.error.message };
      } else if (successMessage) {
        return { error: false, message: successMessage };
      }
    } catch (error) {
      return {
        error: true,
        message:
          error instanceof Error
            ? error.message
            : String(error) || "Une erreur est survenue",
      };
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ActionButton {...props} isPending={isPending} onClick={handleClick} />
  );
}
