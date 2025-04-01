import {
  Sidebar,
  SidebarContent,
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
  Table2Icon,
  TableIcon,
} from "lucide-react";
import { UploadButton } from "./UploadButton";
import { DownloadProjectButton } from "./DownloadProjectButton";
import { LoadExampleButton } from "./LoadExampleButton";
import { ClearButton } from "./ClearButton";
import { useStore } from "zustand";
import { store } from "@/stores/global";

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
                          to="/analysis/nlp"
                          activeProps={{ className: "font-bold" }}
                        >
                          <CircleHelpIcon />
                          <span>NLP Analysis</span>
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
    </Sidebar>
  );
}
