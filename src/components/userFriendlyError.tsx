import { ZodError } from "zod";

export function userFriendlyError(error: unknown) {
  if (error instanceof ZodError) {
    // If column is missing then do not report error for each row, but only once.
    const uniqueErrors = new Set(
      error.issues.map((e) => {
        if (!Array.isArray(e.path)) {
          return e.message;
        }
        if (e.path.length === 2) {
          return `${e.path[1]} column ${e.message}`;
        }
        return `${e.path.join(",")} column ${e.message}`;
      }),
    );
    return (
      <ul className="list-inside list-disc">
        {Array.from(uniqueErrors).map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An error occurred";
}
