export const layout = "base.vto";
export default (data: Lume.Data, filters: Lume.Helpers) => {
  const { comp, children } = data;
  return (
    <comp.Container>
      <div class="prose prose-custom">{children}</div>
    </comp.Container>
  );
};
