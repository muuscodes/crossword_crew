import { useOutletContext } from "react-router";
import type { AuthMode } from "../NonAuthContent/Authentication";

// What the layout shares with the page it shows.
export interface LayoutContext {
  openAuth: (mode: AuthMode) => void;
}

// Lets a page open the log in or sign up dialog, like the landing page's buttons do. Null outside
// the layout.
export function useAuthDialog(): LayoutContext["openAuth"] | null {
  return useOutletContext<LayoutContext | undefined>()?.openAuth ?? null;
}
