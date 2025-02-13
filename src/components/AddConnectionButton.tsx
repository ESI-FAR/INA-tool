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
import { useMemo, useState } from "react";
import { useConnections } from "@/hooks/use-connections";
import { statementIdPair2PossibleConnections } from "@/lib/reactFlowConnection2PossibleConnections";
import { connection2id } from "@/lib/connection2id";

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

function ConnectionPicker() {
  const form = useFormContext();
  const driven_by = useFormContext().watch("driven_by");
  const sourceStatementId = useFormContext().watch("source_statement");
  const targetStatementId = useFormContext().watch("target_statement");
  const choices = useMemo(() => {
    return statementIdPair2PossibleConnections(
      driven_by,
      sourceStatementId,
      targetStatementId,
    );
  }, [driven_by, sourceStatementId, targetStatementId]);

  if (!(driven_by && sourceStatementId && targetStatementId)) {
    return null;
  }
  // TODO convert into radio group
  return (
    <ul className="list-outside list-disc">
      {choices.map((c) => (
        <li key={connection2id(c)}>
          <Button
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              form.setValue("source_component", c.source_component);
              form.setValue("target_component", c.target_component);
            }}
          >
            <span>
              {c.source_component}:{c.source_value}
            </span>
            <span>➜</span>
            <span>
              {c.target_component}:{c.target_value}
            </span>
          </Button>
        </li>
      ))}
    </ul>
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
              </fieldset>
              <fieldset className="border p-1">
                <legend>Target</legend>
                <TargetStatementField statements={statements} />
              </fieldset>
              <ConnectionPicker />
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
