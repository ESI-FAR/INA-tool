import type { Connection } from "@/lib/schema";

export function connection2id(connection: Connection): string {
  return `${connection.driven_by}-${connection.source_statement}-${connection.source_component}-2-${connection.target_statement}-${connection.target_component}`;
}

export function compareConnection(a: Connection, b: Connection): boolean {
  return (
    a.source_statement === b.source_statement &&
    a.source_component === b.source_component &&
    a.target_statement === b.target_statement &&
    a.target_component === b.target_component &&
    a.driven_by === b.driven_by
  );
}

/**
 * Filters a list of new connections to exclude those that are already present in a reference list of connections.
 *
 * @param {Connection[]} newConnections - An array of new connections to filter.
 * @param {Connection[]} refConnections - An array of reference connections to check against.
 * @returns {Connection[]} A new array containing only the connections from `newConnections` that are not present in `refConnections`.
 */
export function removeKnownConnections(
  newConnections: Connection[],
  refConnections: Connection[],
): Connection[] {
  const currentConnectionIds = new Set(refConnections.map(connection2id));
  return newConnections.filter(
    (connection) => !currentConnectionIds.has(connection2id(connection)),
  );
}
