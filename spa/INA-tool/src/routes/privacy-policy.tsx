import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="mt-4 text-4xl font-bold">Privacy Policy</h1>
      <div className="">
        <div className="card-body">
          <h2 className="mb-2 text-2xl font-semibold">Overview</h2>
          <ul className="mb-4 list-inside list-disc">
            <li>This web application uses your web browsers storage.</li>
          </ul>

          <h2 className="mb-2 text-2xl font-semibold">
            Data Collection and Storage
          </h2>
          <ul className="mb-4 list-inside list-disc">
            <li>We do not collect any personal data from users.</li>
            <li>
              All data entered or generated during your session is stored in
              your web browser.
            </li>
          </ul>

          <h2 className="mb-2 text-2xl font-semibold">Third-Party Services</h2>
          <ul className="mb-4 list-inside list-disc">
            <li>
              This web application is hosted at{" "}
              <a
                target="_blank"
                className="underline"
                href="https://pages.github.com/"
              >
                Github Pages
              </a>
              , so GitHub can see who visits.
            </li>
            <li>
              Our website does not utilize any third-party services that track
              users or collect personal information.
            </li>
          </ul>

          <h2 className="mb-2 text-2xl font-semibold">
            Changes to This Policy
          </h2>
          <ul className="mb-4 list-inside list-disc">
            <li>
              We may update our Privacy Policy from time to time. Any changes
              will be reflected on this page.
            </li>
          </ul>

          <h2 className="mb-2 text-2xl font-semibold">Contact Us</h2>
          <ul className="mb-4 list-inside list-disc">
            <li>
              If you have any questions about this Privacy Policy, please
              contact the software contributors via the{" "}
              <a
                href="https://github.com/ESI-FAR/INA-tool"
                target="_blank"
                className="underline"
              >
                GitHub
              </a>{" "}
              page.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
