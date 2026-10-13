export default ({ project }: { project: Lume.Data }) => (
  <a
    href={project.url}
    class="holo-panel group block h-full p-5 no-underline transition hover:-translate-y-1"
    style={`--bracket: ${project.accent}`}
  >
    <div
      class="mb-4 h-1.5 w-full"
      style={`background: linear-gradient(90deg, ${project.accent}, ${project.accent2})`}
    >
    </div>
    <p class="hud-label mb-2" style={`color: ${project.accent}`}>
      {project.status}
    </p>
    <h3 class="mb-1 text-2xl text-ink">{project.title}</h3>
    <p class="mb-4 text-lavender/80">{project.subtitle}</p>
    <ul class="flex flex-wrap gap-1.5">
      {(project.stack ?? []).map((tech: string) => (
        <li class="bg-white/5 px-2 py-0.5 font-mono text-xs text-lavender/80">
          {tech}
        </li>
      ))}
    </ul>
  </a>
);
