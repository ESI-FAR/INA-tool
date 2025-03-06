import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Statement } from "@/lib/schema";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Hit, searchStatement } from "./search";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

function filterStatements(query: string, statements: Statement[]) {
  if (query === "") {
    return statements;
  }
  return statements.filter((statement) => searchStatement(query, statement));
}

export function StatementComboBox({
  statements,
  value,
  onChange,
}: {
  statements: Statement[];
  value: Statement | undefined;
  onChange: (statement: Statement) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const hits = useMemo(
    () => filterStatements(query, statements),
    [query, statements],
  );
  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open}>
          {value ? <Hit statement={value} query="" /> : "Select statement"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search statement..."
            className="h-9"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No statements found.</CommandEmpty>
            <CommandGroup>
              {hits.map((statement) => (
                <CommandItem
                  key={statement.Id}
                  value={statement.Id}
                  onSelect={(currentValue) => {
                    const selectedStatement = statements.find(
                      (statement) => statement.Id === currentValue,
                    );
                    if (!selectedStatement) {
                      throw new Error("Statement not found");
                    }
                    onChange(selectedStatement);
                    setOpen(false);
                  }}
                >
                  <Hit statement={statement} query={query} />
                  <Check
                    className={cn(
                      "ml-auto",
                      value?.Id === statement.Id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
