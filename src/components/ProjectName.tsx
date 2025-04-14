import { store } from "@/stores/global";
import { useRef, useState } from "react";
import { useStore } from "zustand";

export function ProjectName() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const name = useStore(store, (s) => s.projectName);
  const setName = useStore(store, (s) => s.setProjectName);

  if (editing) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const newName = inputRef.current?.value;
          if (newName) {
            setName(newName);
          }
          setEditing(false);
        }}
      >
        <input
          defaultValue={name}
          className="mx-1 w-48 rounded border-2 bg-background p-1 text-xl"
          maxLength={200}
          minLength={1}
          ref={inputRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setEditing(false);
            }
          }}
        />
        <button title="Save" type="submit">
          🖉
        </button>{" "}
        <button
          title="Cancel"
          type="button"
          onClick={() => {
            setEditing(false);
          }}
        >
          X
        </button>
      </form>
    );
  }

  return (
    <button
      className="flex flex-row text-xl"
      title="Click to change project name"
      onClick={() => {
        setEditing(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }}
    >
      {name}
      <span className="text-muted-foreground hover:text-foreground">🖉</span>
    </button>
  );
}
