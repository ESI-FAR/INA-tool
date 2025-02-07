import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <h1 className="text-center text-4xl font-bold">
        Welcome to the INA tool
      </h1>
      <div>
        <p>First time users can load the example.</p>
        <p></p>
      </div>
    </>
  );
}
