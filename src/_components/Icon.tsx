export default ({ name }: { name: string }) => (
  <span class="icon" style={`--icon: url(/icons/${name}.svg)`} aria-hidden="true" />
);
