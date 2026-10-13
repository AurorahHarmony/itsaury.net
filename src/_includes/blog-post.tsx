export const layout = "base.vto";
export default (data: Lume.Data, filters: Lume.Helpers) => {
  const { comp, children } = data;
  return (
    <comp.Container class="max-w-3xl">
      <div class="holo-panel p-6 sm:p-8">
        <div class="prose prose-custom">{children}</div>
      </div>
    </comp.Container>
  );
};
