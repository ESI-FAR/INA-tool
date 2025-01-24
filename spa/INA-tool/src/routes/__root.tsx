import { AppSidebar } from "@/components/app-sidebar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { createRootRoute, Outlet, retainSearchParams, stripSearchParams } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from "zod";

const defaultProject = '';
const searchSchema = z.object({
  project: z.string().default(defaultProject),
})

export const Route = createRootRoute({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares:[
      retainSearchParams(['project']),
      stripSearchParams({project: defaultProject}),
    ]
  },
  component: () => (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
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
