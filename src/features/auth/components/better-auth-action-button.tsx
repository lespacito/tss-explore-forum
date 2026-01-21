import ActionButton from "@/components/ui/action-button";
import type { ComponentProps } from "react";
import { useState } from "react";
import { toast } from "sonner";

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
        toast.error(res.error.message || "Une erreur est survenue.");
      } else if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : String(error) || "Une erreur est survenue",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ActionButton {...props} isPending={isPending} onClick={handleClick} />
  );
}
