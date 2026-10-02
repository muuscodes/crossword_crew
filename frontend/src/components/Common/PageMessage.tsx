import type { ReactNode } from "react";

// Full-page placeholder for loading and error states.
export default function PageMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center text-2xl font-bold">
      {children}
    </div>
  );
}
