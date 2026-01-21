import { Loader2Icon } from "lucide-react";
import { type ReactNode, Suspense } from "react";

export const LoadingSuspense = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<Loader2Icon className="size-20 animate-spin" />}>
      {children}
    </Suspense>
  );
};
