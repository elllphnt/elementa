import type { ComponentData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";

export const mediaGalleryData: ComponentData = {
  name: "MediaGallery",
  props: [
    {
      name: "images",
      tsType: "string[]",
      defaultValue: [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
        "https://example.com/image3.jpg",
      ],
    },
  ],
  states: [
    {
      id: genId(),
      name: "selectedImageIndex",
      type: "value",
      init: 0,
      tsType: "number",
    },
    {
      id: genId(),
      name: "isVideoPlaying",
      type: "value",
      init: false,
      tsType: "boolean",
    },
  ],
  template: {
    id: genId(),
    type: "container",
    content: [
      {
        id: genId(),
        type: "text",
        text: "Media Gallery",
      },
      {
        id: genId(),
        type: "container",
        content: [
          {
            id: genId(),
            type: "media",
            media: {
              type: "image",
              src: { __expression: "props.images[state.selectedImageIndex]" },
              alt: { __expression: "`Image ${state.selectedImageIndex + 1}`" },
            },
            fit: "cover",
            position: {
              x: { value: 50, unit: "%" },
              y: { value: 50, unit: "%" },
            },
          },
        ],
      },
      {
        id: genId(),
        type: "container",
        content: [
          {
            id: genId(),
            type: "media",
            media: {
              type: "video",
              src: "https://example.com/demo-video.mp4",
              autoplay: { __expression: "state.isVideoPlaying ? 'true' : 'false'" },
              controls: "true",
              loop: "true",
              muted: "true",
              poster: "https://example.com/video-poster.jpg",
            },
            fit: "contain",
          },
        ],
      },
      {
        id: genId(),
        type: "container",
        content: [
          {
            id: genId(),
            type: "text",
            text: { __expression: "`Selected: Image ${state.selectedImageIndex + 1} of ${props.images.length}`" },
          },
          {
            id: genId(),
            type: "text",
            text: { __expression: "state.isVideoPlaying ? 'Video is playing' : 'Video is paused'" },
          },
        ],
      },
    ],
  },
};

export const mediaGalleryFileData: TestFileData = {
  id: genId(),
  path: "media-gallery",
  content: JSON.stringify(mediaGalleryData, null, 2),
};
