export const title = "Projects";

export default (data: Lume.Data) => {
  const { comp, search } = data;
  const projects = search.pages("type=project", "order");

  return (
    <comp.Container>
      <p class="hud-label mb-3">Cartridge select</p>
      <h1 class="mb-8 text-4xl sm:text-5xl">Projects</h1>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => <comp.ProjectCard project={project} />)}
      </div>
    </comp.Container>
  );
};
