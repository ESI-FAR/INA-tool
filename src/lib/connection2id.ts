import { Connection } from "@/lib/schema";

export function connection2id(connection: Connection): string {
  return `${connection.driven_by}-${connection.source_statement}-${connection.source_component}-2-${connection.target_statement}-${connection.target_component}`;
}
