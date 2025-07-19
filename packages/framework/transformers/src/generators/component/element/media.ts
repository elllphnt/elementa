import type {
  ImageMediaData,
  MediaElementData,
  VideoMediaData,
} from "@elllphnt/elementa-base";
import { generateDynamic } from "../misc/dynamic.js";
import type { GeneratorContext } from "../types.js";
import { generatorBaseElement } from "./base.js";

export function generatorMediaElement({
  data,
  context,
}: {
  data: MediaElementData;
  context: GeneratorContext;
}): string {
  const media = data.media;

  if (!media) {
    return `<>{/* Missing media content */}</>`;
  }

  const props: Record<string, string> = {};
  const style: Record<string, string> = {};

  // 1. Shared: src
  if (media.src) {
    props["src"] = generateDynamic(media.src);
  }

  // 2. Shared: fit & position
  if (data.fit) {
    style.objectFit = generateDynamic(data.fit);
  }
  if (data.position?.x) {
    style.objectPositionX = generateDynamic(data.position.x);
  }
  if (data.position?.y) {
    style.objectPositionY = generateDynamic(data.position.y);
  }

  // 3. Type-specific
  if (media.type === "image") {
    const image = media as ImageMediaData;
    if (image.alt) {
      props["alt"] = generateDynamic(image.alt);
    }
  }

  if (media.type === "video") {
    const video = media as VideoMediaData;

    if (video.poster) {
      props["poster"] = generateDynamic(video.poster);
    }
    if (video.autoplay) {
      props["autoPlay"] = generateDynamic(video.autoplay);
    }
    if (video.loop) {
      props["loop"] = generateDynamic(video.loop);
    }
    if (video.muted) {
      props["muted"] = generateDynamic(video.muted);
    }
    if (video.controls) {
      props["controls"] = generateDynamic(video.controls);
    }
  }

  // 4. Style
  if (Object.entries(style).length) {
    const styleEntries = Object.entries(style)
      .map(([key, s]) => `${key}: ${s}`)
      .join(", ");
    props["style"] = `{ ${styleEntries} }`;
  }

  const tag = media.type === "video" ? "video" : "img";

  return generatorBaseElement({
    tag,
    props,
    data,
    context,
  });
}
