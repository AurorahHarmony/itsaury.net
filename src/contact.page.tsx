import { Social } from "./_data/socials.ts";

export const title = "Contact";

export default (data: Lume.Data, filters: Lume.Helpers) => {
  const { comp, socials } = data;
  return (
    <comp.Container>
      <h1 class="text-4xl mb-2">Contact</h1>
      <h2 class="text-2xl mb-2">Email:</h2>
      <p className="mb-2">
        <a href="mailto:me@itsaury.net" class="link">
          me@itsaury.net
        </a>
      </p>
      <h2 class="text-2xl mb-2">Other Links:</h2>
      <ul class="list-disc list-inside">
        {socials.map((social: Social) => (
          <li>
            <a
              href={social.url}
              target="_blank"
              rel="noopener"
              class="link"
            >
              {social.name}
            </a>
          </li>
        ))}
      </ul>
    </comp.Container>
  );
};
