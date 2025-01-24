import { Route } from "@/routes/__root";
import { useNavigate } from "@tanstack/react-router";

export function setProject(project: string) {
  // const search = { project };
  // Route.router?.navigate({
  //   search,
  // });
  window.location.search = `?project=${project}`;
}

export function getProject() {
  const search = Route.router?.parseLocation().search
  const params =  new URLSearchParams(search);
  return params.get('project') ?? '';
}

export function useProjectName() {
  const { project } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  function setProject(name: string) {
    navigate({ search: (prev) => ({ ...prev, project: name }) });
  }
  return [project ?? '', setProject] as const;
}
