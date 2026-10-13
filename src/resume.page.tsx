export const title = "Resume";

export default (data: Lume.Data) => {
  const { comp, resume } = data;
  return (
    <comp.Container class="max-w-3xl">
      <p class="hud-label mb-3">Player profile</p>
      <h1 class="mb-4 text-4xl sm:text-5xl">{resume.name}</h1>
      <p class="mb-8 text-lavender">{resume.summary}</p>

      <ul class="mb-12 flex flex-wrap gap-2">
        {resume.skills.map((skill: string) => (
          <li class="holo-panel px-3 py-1 font-mono text-sm text-ink">{skill}</li>
        ))}
      </ul>

      <section class="mb-12">
        <h2 class="mb-4 text-3xl text-holo">Experience</h2>
        <div class="space-y-4">
          {resume.experience.map((job: Lume.Data) => (
            <article class="holo-panel p-5">
              <h3 class="text-xl">{job.name}</h3>
              <p class="hud-label mb-3">{job.date}</p>
              <ul class="list-disc space-y-1 pl-5 marker:text-magenta">
                {job.responsibilities.map((line: string) => <li>{line}</li>)}
              </ul>
            </article>
          ))}
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
            </article>
          ))}
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-4 text-3xl text-magenta">Clubs and organisations</h2>
        <ul class="holo-panel list-disc space-y-1 py-4 pr-5 pl-9 marker:text-holo">
          {resume.clubs.map((club: string) => <li>{club}</li>)}
        </ul>
      </section>

      <p class="print:hidden">
        <button type="button" class="btn-ghost" onclick="print()">Print / save PDF</button>
      </p>
    </comp.Container>
  );
};
