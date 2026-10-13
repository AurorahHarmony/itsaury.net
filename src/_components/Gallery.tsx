interface Image {
  src: string;
  alt: string;
  caption?: string;
}

export default ({ images }: { images: Image[] }) => (
  <div class="not-prose my-8 grid grid-cols-2 gap-3 md:grid-cols-3">
    {images.map((image) => (
      <figure>
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          data-lightbox
          class="aspect-square w-full cursor-zoom-in border border-holo/20 object-cover"
        />
        {image.caption && (
          <figcaption class="mt-1 font-mono text-xs text-lavender/70">
            {image.caption}
          </figcaption>
        )}
      </figure>
    ))}
  </div>
);
