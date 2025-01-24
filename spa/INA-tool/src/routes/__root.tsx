import { AppSidebar } from "@/components/app-sidebar";
import { Footer } from "@/components/Footer";
import { ProjectName } from "@/components/ProjectName";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import {
  createRootRoute,
  Outlet,
  retainSearchParams,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  search: {
    middlewares: [
      // @ts-expect-error project comes from zustand not router
      retainSearchParams(["project"]),
    ],
  },
  component: () => (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 justify-between gap-2 border-b p-2">
              <SidebarTrigger />
              <ProjectName />
              <ThemeToggle />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4">
              <Outlet />
            </main>
            <Toaster />
            <Footer />
          </SidebarInset>
        </SidebarProvider>
        <TanStackRouterDevtools />
      </ThemeProvider>
    </>
  ),
});
