import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Statement } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statementLabel(statement: Statement): string {
  const formalism = statement["Statement Type"] === "formal" ? "F" : "I";
  return formalism + statement.Id;
}
