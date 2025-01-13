import { Link } from "@tanstack/react-router";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light mt-auto py-4">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center justify-content-between small">
          <div className="text-muted">
            Copyright &copy;
            <a href="https://www.esciencecenter.nl/" target="_blank">
              Netherlands eScience Center
            </a>
            {currentYear} · Matrix THREE, Science Park 402, 1098 XH Amsterdam
          </div>
          <div>
            <a href="https://github.com/ESI-FAR/INA-tool">
              <i className="fa-brands fa-github"></i>
            </a>
            &middot;
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
