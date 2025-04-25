import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";

export function Header() {
  const { open } = useSidebar();
  return (
    <header className="flex h-16 justify-between gap-2 border-b p-2">
      <div className="flex gap-1">
        <SidebarTrigger />
        {!open && (
          <div className="text-2xl">Institutional Network Analysis Tool</div>
        )}
      </div>
      <ThemeToggle />
    </header>
  );
}
