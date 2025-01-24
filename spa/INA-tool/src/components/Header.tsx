import { ProjectName } from "@/components/ProjectName";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PersistButtons } from "./PersistButtons";

export function Header() {
  return (
    <header className="flex h-16 justify-between gap-2 border-b p-2">
      <SidebarTrigger />
      <ProjectName />
      <div className="flex gap-2">
        <PersistButtons/>
      <ThemeToggle />
      </div>
    </header>
  );
}
