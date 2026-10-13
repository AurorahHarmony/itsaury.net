export default (data: Lume.Data, _filters: Lume.Helpers) => {
  const { children } = data;
  const className = (data.class as string | undefined) ?? "";
  return <div class={`px-4 max-w-6xl mx-auto ${className}`}>{children}</div>;
};
