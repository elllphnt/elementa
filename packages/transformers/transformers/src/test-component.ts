import type { ComponentData } from "@elllphnt/elementa-base";
import { compileComponent } from "./compilers/component/component.js";

// Test data
const testComponent: ComponentData = {
  name: "TestComponent",
  props: [
    {
      name: "title",
      tsType: "string",
      required: true,
    },
    {
      name: "count",
      tsType: "number",
      required: false,
    },
  ],
  content: [
    {
      type: "container",
      id: "container-1",
      tag: "div",
      content: [
        {
          type: "text",
          id: "title-text",
          tag: "h1",
          text: "{{props.title}}",
        },
        {
          type: "text",
          id: "count-text",
          tag: "p",
          text: "Count: {{props.count || 0}}",
        },
      ],
    },
  ],
  states: [
    {
      type: "value",
      id: "isVisible-state",
      name: "isVisible",
      init: true,
    },
  ],
  fragments: [
    {
      id: "header",
      content: [
        {
          type: "text",
          id: "header-text",
          text: "This is a header fragment",
        },
      ],
    },
  ],
};

// Compile and output the result
try {
  const result = compileComponent(testComponent);
  console.log("Compiled component:");
  console.log(result);
} catch (error) {
  console.error("Compilation failed:", error);
}
