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
        className="flex w-full flex-row items-center justify-between"
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
          className="mx-1 w-44 rounded border-2 bg-background p-1 text-xl"
          maxLength={200}
          minLength={1}
          ref={inputRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setEditing(false);
            }
          }}
        />
        <div>
          <button
            title="Save"
            type="submit"
            className="hover:bg-accent hover:text-accent-foreground"
          >
            🖉
          </button>{" "}
          <button
            title="Cancel"
            type="button"
            className="hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setEditing(false);
            }}
          >
            X
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      className="flex w-full flex-row justify-between"
      title="Click to change project name"
      onClick={() => {
        setEditing(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }}
    >
      <span className="text-xl">{name}</span>
      <span className="text-muted-foreground hover:text-foreground">🖉</span>
    </button>
  );
}
