interface Props {
  src: string;
  poster?: string;
  caption?: string;
  loop?: boolean;
}

export default ({ src, poster, caption, loop }: Props) => (
  <figure class="my-8">
    <video
      src={src}
      poster={poster}
      controls={!loop}
      loop={loop}
      autoplay={loop}
      muted={loop}
      playsinline
      class="w-full border border-holo/20"
    />
    {caption && (
      <figcaption class="mt-2 text-center font-mono text-xs text-lavender/70">
        {caption}
      </figcaption>
    )}
  </figure>
);
