import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import {
  AlignJustifyIcon,
  CircleHelpIcon,
  NetworkIcon,
  ServerCogIcon,
  Table2Icon,
  TableIcon,
  ThermometerIcon,
} from "lucide-react";
import { UploadButton } from "./UploadButton";
import { DownloadProjectButton } from "./DownloadProjectButton";
import { LoadExampleButton } from "./LoadExampleButton";
import { ClearButton } from "./ClearButton";
import { useStore } from "zustand";
import { store } from "@/stores/global";
import { Footer } from "./Footer";
import { ProjectName } from "./ProjectName";

export function AppSidebar() {
  const nrStatements = useStore(store, (state) => state.statements.length);
  const nrConnections = useStore(store, (state) => state.connections.length);
  const nrConflicts = useStore(store, (state) => state.conflicts.length);
  return (
    <Sidebar>
      <SidebarHeader className="px-4 text-2xl">
        Institutional Network Analysis Tool
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Project</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem className="px-2">
              <ProjectName />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/network/comp"
                    activeProps={{ className: "font-bold" }}
                  >
                    <AlignJustifyIcon />
                    <span>Component network</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/network/statement"
                    activeProps={{ className: "font-bold" }}
                  >
                    <NetworkIcon />
                    <span>Statement network</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/statements"
                    activeProps={{ className: "font-bold" }}
                  >
                    <Table2Icon />
                    <span>Statements table</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>{nrStatements}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/connections"
                    activeProps={{ className: "font-bold" }}
                  >
                    <TableIcon />
                    <span>Connections table</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>{nrConnections}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/conflicts"
                    activeProps={{ className: "font-bold" }}
                  >
                    <TableIcon />
                    <span>Conflicts table</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>{nrConflicts}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarGroup>
                <SidebarGroupLabel>Analysis</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/analysis/metrics"
                    activeProps={{ className: "font-bold" }}
                  >
                    <ThermometerIcon />
                    <span>Metrics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        to="/analysis/nlp"
                        activeProps={{ className: "font-bold" }}
                      >
                        <ServerCogIcon />
                        <span>Propose connections</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarGroupContent>
              </SidebarGroup>

              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/help" activeProps={{ className: "font-bold" }}>
                    <CircleHelpIcon />
                    <span>Help</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
             
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <UploadButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <DownloadProjectButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <LoadExampleButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <ClearButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-0">
        <Footer />
      </SidebarFooter>
    </Sidebar>
  );
}
