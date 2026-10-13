interface Props {
  src: string;
  alt: string;
  caption?: string;
  width?: string;
  pixelated?: boolean;
}

export default ({ src, alt, caption, width, pixelated }: Props) => (
  <figure class="my-8" style={width ? `max-width: ${width}; margin-inline: auto` : ""}>
    <img
      src={src}
      alt={alt}
      loading="lazy"
      data-lightbox
      class={`w-full cursor-zoom-in border border-holo/20 ${pixelated ? "pixelated" : ""}`}
    />
    {caption && (
      <figcaption class="mt-2 text-center font-mono text-xs text-lavender/70">
        {caption}
      </figcaption>
    )}
  </figure>
);
