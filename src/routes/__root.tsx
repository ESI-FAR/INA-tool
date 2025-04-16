import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  createRootRoute,
  Outlet,
  retainSearchParams,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { setupStorePersistence } from "@/lib/persist";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

setupStorePersistence();

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

export const Route = createRootRoute({
  search: {
    middlewares: [
      // @ts-expect-error project comes from zustand not router
      retainSearchParams(["project"]),
    ],
  },
  component: () => {
    return (
      <>
        <ThemeProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Header />
              <main className="flex flex-1 flex-col gap-4 p-4">
                <Outlet />
              </main>
              <Toaster />
            </SidebarInset>
          </SidebarProvider>
          <Suspense>
            <TanStackRouterDevtools />
          </Suspense>
        </ThemeProvider>
      </>
    );
  },
});
