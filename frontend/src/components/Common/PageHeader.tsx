import type { ReactNode } from "react";
import { CHIP_YELLOW } from "./styles";

interface PageHeaderProps {
  // The small yellow tag above the title, like the "1 Across" tags on the landing page.
  label: ReactNode;
  title: ReactNode;
  // A sentence or two under the title.
  children?: ReactNode;
  // Something to sit beside the title, like a help button.
  aside?: ReactNode;
  center?: boolean;
}

export default function PageHeader({ label, title, children, aside, center = false }: PageHeaderProps) {
  return (
    <header className={`flex flex-col gap-4 ${center ? "items-center text-center" : "items-start text-left"}`}>
      <p className={CHIP_YELLOW}>{label}</p>
      <div className="flex max-w-full items-center gap-4">
        <h1 className="min-w-0 break-words text-4xl font-extrabold tracking-tight sm:text-6xl">{title}</h1>
        {aside}
      </div>
      {children && <div className="max-w-2xl text-lg text-neutral-700 sm:text-xl">{children}</div>}
    </header>
  );
}
