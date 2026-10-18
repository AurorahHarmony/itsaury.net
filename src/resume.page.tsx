export const title = "Resume";
export const metas = {
  description: "Aury's resume: software engineer and Computer Science graduate from Auckland, with experience in React, TypeScript, Python, and full-stack web development.",
};

const Job = ({ job }: { job: Lume.Data }) => (
  <article class="holo-panel p-5">
    <h3 class="text-xl">{job.name}</h3>
    <p class="mb-3 text-sm text-lavender/80">
      {job.company}
      {job.about && <span class="text-lavender/60"> ({job.about})</span>}
      {" · "}
      <span class="font-mono">{job.date}</span>
    </p>
    <ul class="list-disc space-y-1 pl-5 marker:text-magenta">
      {job.responsibilities.map((line: string) => <li>{line}</li>)}
    </ul>
  </article>
);

export default (data: Lume.Data) => {
  const { comp, resume } = data;
  return (
    <comp.Container class="max-w-3xl">
      <p class="hud-label mb-3">Player profile</p>
      <h1 class="mb-4 text-4xl sm:text-5xl">{resume.name}</h1>
      <ul class="mb-6 flex flex-wrap gap-3">
        {resume.links.map((link: Lume.Data) => (
          <li>
            <a
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener"
              class="holo-panel flex items-center gap-2 px-3 py-2 text-ink no-underline transition hover:-translate-y-0.5"
            >
              <comp.Icon name={link.icon} />
              <span class="font-hud text-xs uppercase tracking-widest">{link.name}</span>
            </a>
          </li>
        ))}
      </ul>
      <p class="mb-8 text-lavender">{resume.summary}</p>

      <div class="mb-12 space-y-4">
        {resume.skills.map((group: Lume.Data) => (
          <div>
            <p class="hud-label mb-2">{group.group}</p>
            <ul class="flex flex-wrap gap-2">
              {group.items.map((skill: string) => (
                <li class="holo-panel px-3 py-1 font-mono text-sm text-ink">{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section class="mb-12">
        <h2 class="mb-4 text-3xl text-holo">Experience</h2>
        <div class="space-y-4">
          {resume.experience.map((job: Lume.Data) => <Job job={job} />)}
        </div>
      </section>

      <section class="mb-12">
        <h2 class="mb-4 text-3xl text-peach">Research</h2>
        <div class="space-y-4">
          {resume.research.map((job: Lume.Data) => <Job job={job} />)}
        </div>
      </section>

      <section class="mb-12">
        <h2 class="mb-4 text-3xl text-sun">Education</h2>
        <div class="space-y-3">
          {resume.education.map((edu: Lume.Data) => (
            <article class="holo-panel p-4">
              <h3 class="text-lg">{edu.name}</h3>
              <p class="text-sm text-lavender/80">
                <span class="font-mono">{edu.date}</span> · {edu.awarder}
              </p>
              {edu.details && <p class="mt-1 text-sm">{edu.details}</p>}
            </article>
          ))}
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-4 text-3xl text-magenta">Leadership and volunteering</h2>
        <ul class="holo-panel list-disc space-y-1 py-4 pr-5 pl-9 marker:text-holo">
          {resume.clubs.map((club: string) => <li>{club}</li>)}
        </ul>
      </section>

      <p class="mb-4 font-mono text-sm text-lavender/60">Last updated {resume.updated}</p>

      <p class="print:hidden">
        <button type="button" class="btn-ghost" onclick="print()">Print / save PDF</button>
      </p>
    </comp.Container>
  );
};
