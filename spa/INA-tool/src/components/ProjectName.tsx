import { useProjectName } from "@/hooks/useProjectName";
import { useRef, useState } from "react";

export function ProjectName() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [project, setProject] = useProjectName();

  if (editing) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const newName = inputRef.current?.value;
          if (newName) {
            setProject(newName);
          }
          setEditing(false);
        }}
      >
        <input
          defaultValue={project}
          className="mx-1 rounded border-2 bg-background p-1"
          maxLength={200}
          minLength={1}
          ref={inputRef}
          onBlur={() => setEditing(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setEditing(false);
            }
          }}
        />
        <button title="Save" type="submit">
          🖉
        </button>
      </form>
    );
  }

  return (
    <button
      className="group/name flex flex-row"
      title="Click to change project name"
      onClick={() => {
        setEditing(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }}
    >
      {project}
      <span className="invisible ps-1 group-hover/name:visible">🖉</span>
    </button>
  );
}
