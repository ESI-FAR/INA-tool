import { Check, ChevronsUpDown, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Connection,
  connectionSchema,
  DrivenBy,
  Statement,
} from "@/lib/schema";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useStatements } from "../hooks/use-statements";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useConnections } from "@/hooks/use-connections";

function DrivenByField() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="driven_by"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Driven by</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(e) => {
                field.onChange(e);
                form.resetField("source_statement");
                form.resetField("target_statement");
                form.resetField("source_component");
                form.resetField("target_component");
              }}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="actor" />
                </FormControl>
                <FormLabel className="font-normal">Actor</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="outcome" />
                </FormControl>
                <FormLabel className="font-normal">Outcome</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="sanction" />
                </FormControl>
                <FormLabel className="font-normal">Sanction</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function canStatementBeSourceForDrivenBy(driven_by: DrivenBy) {
  return (statement: Statement) => {
    if (driven_by === "actor") {
      const hassDirectAnimate =
        statement["Direct Object"] &&
        statement["Type of Direct Object"] === "animate";
      const hasInDirectAnimate =
        statement["Indirect Object"] &&
        statement["Type of Indirect Object"] === "animate";
      const hasExecutionConstraint = statement["Execution Constraint"];
      return hassDirectAnimate || hasInDirectAnimate || hasExecutionConstraint;
    }
    if (driven_by === "outcome") {
      const hasDirectInanimate =
        statement["Direct Object"] &&
        statement["Type of Direct Object"] === "inanimate";
      const hasInDirectInanimate =
        statement["Indirect Object"] &&
        statement["Type of Indirect Object"] === "inanimate";
      return hasDirectInanimate || hasInDirectInanimate;
    }
    if (driven_by === "sanction") {
      // Aim is required so never ambiguous
      return true;
    }
    return false;
  };
}

function SourceStatementField({ statements }: { statements: Statement[] }) {
  const form = useFormContext();
  const driven_by = useFormContext().watch("driven_by");
  const targetStatement = useFormContext().watch("target_statement");
  const choices = useMemo(() => {
    const filter = canStatementBeSourceForDrivenBy(driven_by);
    const choices = statements.filter(filter);
    if (targetStatement) {
      // TODO filter out current connections
      return choices.filter((statement) => statement.Id !== targetStatement);
    }
    return choices;
  }, [driven_by, statements, targetStatement]);
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="source_statement"
      render={({ field }) => (
        <FormItem className="flex flex-col py-2">
          <FormLabel>Statement</FormLabel>
          <Popover modal={true} open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value
                    ? choices.find((statement) => statement.Id === field.value)
                        ?.Id
                    : "Select statement"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search statement..." />
                <CommandList>
                  <CommandEmpty>No statement found.</CommandEmpty>
                  <CommandGroup>
                    {choices.map((statement) => (
                      <CommandItem
                        value={statement.Id}
                        key={statement.Id}
                        onSelect={() => {
                          form.setValue("source_statement", statement.Id);
                          form.resetField("source_component");
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            statement.Id === field.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {statement["Statement Type"] === "formal" ? "F" : "I"}
                        {statement.Id}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function canStatementBeTargetForDrivenBy(driven_by: DrivenBy) {
  return (statement: Statement) => {
    if (driven_by === "actor") {
      // Attribute is required so always valid
      return true;
    } else if (
      (driven_by === "outcome" || driven_by === "sanction") &&
      statement["Activation Condition"]
    ) {
      return true;
    }
    return false;
  };
}

function TargetStatementField({ statements }: { statements: Statement[] }) {
  const form = useFormContext();
  const driven_by = useFormContext().watch("driven_by");
  const sourceStatement = useFormContext().watch("source_statement");
  const choices = useMemo(() => {
    const filter = canStatementBeTargetForDrivenBy(driven_by);
    const choices = statements.filter(filter);
    if (sourceStatement) {
      // TODO filter out current connections
      return choices.filter((statement) => statement.Id !== sourceStatement);
    }
    return choices;
  }, [driven_by, statements, sourceStatement]);
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="target_statement"
      render={({ field }) => (
        <FormItem className="flex flex-col py-2">
          <FormLabel>Statement</FormLabel>
          <Popover modal={true} open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value
                    ? choices.find((statement) => statement.Id === field.value)
                        ?.Id
                    : "Select statement"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search statement..." />
                <CommandList>
                  <CommandEmpty>No statement found.</CommandEmpty>
                  <CommandGroup>
                    {choices.map((statement) => (
                      <CommandItem
                        value={statement.Id}
                        key={statement.Id}
                        onSelect={() => {
                          form.setValue("target_statement", statement.Id);
                          form.resetField("target_component");
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            statement.Id === field.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {statement["Statement Type"] === "formal" ? "F" : "I"}
                        {statement.Id}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface SourceChoice {
  type: string;
  label: string;
  value: string;
}

function deriveSourceChoices(statement: Statement, type: string) {
  const choices: SourceChoice[] = [];
  const id = statement.Id!;
  // for each type return choice if it is present
  if (type === "actor") {
    if (
      statement["Direct Object"] &&
      statement["Type of Direct Object"] === "animate"
    ) {
      choices.push({
        type: id + "-direct-object",
        label: "Direct Object",
        value: statement["Direct Object"],
      });
    }
    if (
      statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "animate"
    ) {
      choices.push({
        type: id + "-indirect-object",
        label: "Indirect Object",
        value: statement["Indirect Object"],
      });
    }
    if (statement["Execution Constraint"]) {
      choices.push({
        type: id + "-execution-constraint",
        label: "Execution Constraint",
        value: statement["Execution Constraint"],
      });
    }
  } else if (type === "outcome") {
    if (
      statement["Direct Object"] &&
      statement["Type of Direct Object"] === "inanimate"
    ) {
      choices.push({
        type: id + "-direct-object",
        label: "Direct Object",
        value: statement["Direct Object"],
      });
    }
    if (
      statement["Indirect Object"] &&
      statement["Type of Indirect Object"] === "inanimate"
    ) {
      choices.push({
        type: id + "-indirect-object",
        label: "Indirect Object",
        value: statement["Indirect Object"],
      });
    }
  } else if (type === "sanction") {
    choices.push({
      type: id + "-aim",
      label: "Aim",
      value: statement["Aim"],
    });
  }

  return choices;
}

function SourceComponentField({ statements }: { statements: Statement[] }) {
  const form = useFormContext();
  const statementId = useFormContext().watch("source_statement");
  const driven_by = useFormContext().watch("driven_by");
  const choices = useMemo(() => {
    const statement = statements.find(
      (statement) => statement.Id === statementId,
    );
    if (!statement) {
      return [];
    }
    const choices = deriveSourceChoices(statement, driven_by);
    return choices.map((c) => ({
      ...c,
      type: c.type.replace(statement.Id! + "-", ""),
    }));
  }, [driven_by, statementId, statements]);

  useEffect(() => {
    // Auto select if there is only one choice
    if (choices.length === 1) {
      form.setValue("source_component", choices[0].type);
    }
  }, [choices, form]);
  return (
    <FormField
      control={form.control}
      name="source_component"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Component</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-col space-y-1"
            >
              {choices.map((choice) => (
                <FormItem
                  key={choice.type}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={choice.type} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {choice.label}: {choice.value}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function deriveTargetChoices(statement: Statement, driven_by: DrivenBy) {
  const choices = [];
  if (driven_by === "actor") {
    choices.push({
      type: "attribute",
      label: "Attribute",
      value: statement.Attribute,
    });
  } else if (
    (driven_by === "outcome" || driven_by === "sanction") &&
    statement["Activation Condition"]
  ) {
    choices.push({
      type: "activation-condition",
      label: "Activation Condition",
      value: statement["Activation Condition"],
    });
  }
  return choices;
}

function TargetComponentField({ statements }: { statements: Statement[] }) {
  const form = useFormContext();
  const statementId = useFormContext().watch("target_statement");
  const driven_by = useFormContext().watch("driven_by");
  const choices = useMemo(() => {
    const statement = statements.find(
      (statement) => statement.Id === statementId,
    );
    if (!statement) {
      return [];
    }
    const choices = deriveTargetChoices(statement, driven_by);
    return choices;
  }, [driven_by, statementId, statements]);

  useEffect(() => {
    // Auto select if there is only one choice
    if (choices.length === 1) {
      form.setValue("target_component", choices[0].type);
    }
  }, [choices, form]);

  return (
    <FormField
      control={form.control}
      name="target_component"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Component</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-col space-y-1"
            >
              {choices.map((choice) => (
                <FormItem
                  className="flex items-center space-x-3 space-y-0"
                  key={choice.type}
                >
                  <FormControl>
                    <RadioGroupItem value={choice.type} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {choice.label}: {choice.value}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function AddConnectionButton() {
  const { statements } = useStatements();
  const { addConnection } = useConnections();
  const myform = useForm<Connection>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      driven_by: "actor",
    },
  });

  function onSubmit(connection: Connection) {
    addConnection(connection);
    myform.reset();
  }
  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          myform.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusIcon />
          Add connection
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <Form {...myform}>
          <form onSubmit={myform.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add connection</DialogTitle>
              <DialogDescription>
                Add a connection between two statements.
              </DialogDescription>
            </DialogHeader>
            <DrivenByField />
            <div className="grid grid-cols-1 gap-1 py-1 md:grid-cols-2">
              <fieldset className="border p-1">
                <legend>Source</legend>
                <SourceStatementField statements={statements} />
                <SourceComponentField statements={statements} />
              </fieldset>
              <fieldset className="border p-1">
                <legend>Target</legend>
                <TargetStatementField statements={statements} />
                <TargetComponentField statements={statements} />
              </fieldset>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit">
                  <PlusIcon /> Add
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
