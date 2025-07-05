import type { ComponentData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";

export const contactData: ComponentData = {
  name: "ContactPage",
  states: [
    {
      id: genId(),
      name: "formData",
      type: "value",
      init: { name: "", email: "", message: "" },
      tsType: "{ name: string; email: string; message: string }",
    },
    {
      id: genId(),
      name: "isSubmitting",
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
        text: "Contact Us",
      },
      {
        id: genId(),
        type: "container",
        content: [
          {
            id: genId(),
            type: "text",
            text: {
              __expression:
                "state.isSubmitting ? 'Submitting...' : 'Send Message'",
            },
          },
        ],
      },
      {
        id: genId(),
        type: "media",
        media: {
          type: "video",
          src: "https://example.com/contact-video.mp4",
          autoplay: "false",
          controls: "true",
          poster: "https://example.com/video-poster.jpg",
        },
        fit: "contain",
      },
    ],
  },
};

export const contactFileData: TestFileData = {
  id: genId(),
  path: "contact",
  content: JSON.stringify(contactData, null, 2),
};
