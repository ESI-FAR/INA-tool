import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container-fluid px-4">
      <h1 className="mt-4">Privacy Policy</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="index.php">Dashboard</a>
        </li>
        <li className="breadcrumb-item active">Privacy Policy</li>
      </ol>
      <div className="card mb-4">
        <div className="card-body">
          <h1>Privacy Policy</h1>

          <h2>Overview</h2>
          <ul>
            This web application uses a PHP session cookie to enhance your
            browsing experience. This cookie is essential for the operation of
            the site and is not used for tracking purposes.
          </ul>

          <h2>Data Collection and Storage</h2>
          <ul>
            <li>We do not collect any personal data from users.</li>
            <li>
              No data entered or generated during your session is stored in any
              database on our servers.
            </li>
            <li>
              All information is stored locally on your device and is lost as
              soon as your session is terminated by the user.
            </li>
            <li>Each session last 1440 seconds.</li>
          </ul>

          <h2>Third-Party Services</h2>
          <ul>
            Our website does not utilize any third-party services that track
            users or collect personal information.
          </ul>

          <h2>Changes to This Policy</h2>
          <ul>
            We may update our Privacy Policy from time to time. Any changes will
            be reflected on this page.
          </ul>

          <h2>Contact Us</h2>
          <ul>
            If you have any questions about this Privacy Policy, please contact
            the software contributors via the{" "}
            <a href="https://github.com/ESI-FAR/INA-tool" target="blank">
              GitHub
            </a>{" "}
            page.
          </ul>
        </div>
      </div>
    </div>
  );
}
