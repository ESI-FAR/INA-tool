import { Link } from "@tanstack/react-router";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-auto bg-secondary py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Copyright &copy;
            <a
              href="https://www.esciencecenter.nl/"
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              Netherlands eScience Center
            </a>
            &nbsp;{currentYear} · Matrix THREE, Science Park 402, 1098 XH
            Amsterdam
          </div>
          <div>
            <a
              href="https://github.com/ESI-FAR/INA-tool"
              className="text-gray-600 hover:text-gray-800"
            >
              <i className="fa-brands fa-github"></i>
            </a>
            <Link
              to="/privacy-policy"
              className="text-blue-500 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
