/**
 * Colors of driven connections.
 */

import { DrivenBy } from "@/lib/schema";

export const textColor: Record<DrivenBy, string> = {
  actor: "text-purple-500",
  outcome: "text-green-500",
  sanction: "text-red-500",
} as const;

export const strokeColor: Record<DrivenBy | "color", string> = {
  color: "stroke-foreground",
  outcome: "stroke-green-500",
  actor: "stroke-purple-500",
  sanction: "stroke-red-500",
} as const;

// Need important to override reactflow css
export const bgColor: Record<DrivenBy, string> = {
  outcome: "!bg-green-500",
  actor: "!bg-purple-500",
  sanction: "!bg-red-500",
} as const;
