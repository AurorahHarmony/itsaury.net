export const title = "Blog";

export default (data: Lume.Data, filters: Lume.Helpers) => {
  const { comp, search } = data;

  const posts = search.pages("type=blog-post", "date=desc", 8);

  return (
    <comp.Container>
      <h1 class="text-4xl">Blog</h1>
      <ul class="mt-6 list-disc list-inside space-y-1.5">
        {posts.map((post) => (
          <li>
            <a href={post.url} class="link">
              <b>{filters.date(post.date, "y-MM-dd")}</b> - {post.title}
            </a>
          </li>
        ))}
      </ul>
    </comp.Container>
  );
};
