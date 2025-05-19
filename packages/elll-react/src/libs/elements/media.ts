import {
  ImageMediaData,
  MediaElementData,
  VideoMediaData,
} from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import { transpileDynamic } from "../dynamic.js";
import { TranspileElementOptions, transpileBaseElement } from "./_base.js";

export function transpileMediaElement(
  data: MediaElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const base = transpileBaseElement(data, context);
  const media = data.media;

  if (!media) {
    context.addDiagnostic?.({
      level: TranspilerDiagnosticLevel.Warning,
      message: `Media element missing 'media' definition`,
      data: { id: data.id },
    });

    return {
      generate: () => `<>{/* Missing media content */}</>`,
    };
  }

  const props: Record<string, TranspilerResult> = {};
  const style: Record<string, TranspilerResult> = {};

  // 1. Shared: src
  if (media.src) {
    props["src"] = transpileDynamic(media.src, context);
  }

  // 2. Shared: fit & position
  if (data.fit) {
    style.objectFit = transpileDynamic(data.fit, context);
  }
  if (data.position?.x) {
    style.objectPositionX = transpileDynamic(data.position.x, context);
  }
  if (data.position?.y) {
    style.objectPositionY = transpileDynamic(data.position.y, context);
  }

  // 3. Type-specific
  if (media.type === "image") {
    const image = media as ImageMediaData;
    if (image.alt) {
      props["alt"] = transpileDynamic(image.alt, context);
    }
  }

  if (media.type === "video") {
    const video = media as VideoMediaData;

    if (video.poster) {
      props["poster"] = transpileDynamic(video.poster, context);
    }
    if (video.autoplay) {
      props["autoPlay"] = transpileDynamic(video.autoplay, context);
    }
    if (video.loop) {
      props["loop"] = transpileDynamic(video.loop, context);
    }
    if (video.muted) {
      props["muted"] = transpileDynamic(video.muted, context);
    }
    if (video.controls) {
      props["controls"] = transpileDynamic(video.controls, context);
    }
  }

  // 4. Style
  if (Object.entries(style).length) {
    props["style"] = {
      generate: (env) =>
        `{ ${Object.entries(style)
          .map(([key, s]) => `${key}: ${s.generate(env)}`)
          .join(", ")} }`,
    };
  }

  const tag = media.type === "video" ? "video" : "img";

  return {
    generate: (env, upstream) => {
      return base.generate(env, {
        ...upstream,
        tag,
        props: {
          ...(upstream.props ?? {}),
          ...props,
        },
      });
    },
  };
}
