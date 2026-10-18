import { transformImages } from "../_includes/images.ts";

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  resolution?: number;
  class?: string;
}

export default ({ src, alt, width, height, resolution = 3, class: className = "" }: Props) => (
  <figure
    class={`holo-art ${className}`}
    data-holo-art
    data-resolution={resolution}
    style={`aspect-ratio: ${width} / ${height}`}
  >
    <img src={src} alt={alt} width={width} height={height} decoding="async" transform-images={transformImages(src, "640@2")} />
    <canvas aria-hidden="true"></canvas>
  </figure>
);
