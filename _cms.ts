import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS({
  site: { name: "itsaury.net", url: "https://itsaury.net" },
});

cms.upload("uploads: Uploaded files", "src:uploads");

cms.collection({
  name: "blog",
  label: "Blog posts",
  icon: "note",
  store: "src:blog/*/index.mdx",
  documentName(data) {
    const date = data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date ?? "").slice(0, 10);
    const slug = String(data.title ?? "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `${date}_${slug}/index.mdx`;
  },
  documentLabel: (name) => name.split("/")[0],
  fields: [
    "title: text!",
    "date: date!",
    {
      name: "excerpt",
      type: "textarea",
      description: "Shown in the post list, RSS feed and link previews.",
    },
    {
      name: "tags",
      type: "list",
      init(field, { data }) {
        field.options = data.site?.search.values("tags");
      },
    },
    {
      name: "draft",
      type: "checkbox",
      description: "If checked, the post will not be published.",
    },
    {
      name: "images",
      type: "file-list",
      label: "Post images",
      description:
        "Uploads are saved to this post's own folder. Save the post first, then copy the path into the content.",
      fields: [
        {
          name: "src",
          type: "file",
          upload: "uploads:blog/{document_dirname}",
        },
        "alt: text",
        "caption: text",
      ],
    },
    {
      name: "content",
      type: "markdown",
      upload: "uploads",
      snippets: [
        {
          label: "Callout",
          value: '<comp.Callout title="NOTE">\n{$}\n</comp.Callout>',
        },
        {
          label: "Figure",
          value: '<comp.Figure src="" alt="" caption="{$}" />',
        },
        {
          label: "Gallery",
          value:
            '<comp.Gallery images={[\n  { src: "", alt: "", caption: "" },\n]} />',
        },
      ],
    },
  ],
});

cms.git();

export default cms;
