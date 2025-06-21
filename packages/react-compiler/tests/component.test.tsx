import { ComponentData } from "@elllphnt/elementa-base";
import { render } from "@testing-library/react";
import { pathToFileURL } from "url";
import { expect, test } from "vitest";
import { transpileComponent } from "../src/index.js";
import { TestTranspilerContext, writeTestModule } from "./_utils.js";

// Simple test component

test("should render transpiled component correctly", async () => {
  const component: ComponentData = {
    fragments: [
      {
        id: "root",
        content: [
          {
            id: "text-1",
            type: "text",
            text: "Hello World",
          },
        ],
      },
    ],
    template: {
      id: "root",
      type: "fragment",
      fragmentId: "root",
      params: {},
    },
  };

  const context = new TestTranspilerContext();
  const result = transpileComponent(component, context);
  const code = result.generate(await context.resolveEnvironment());

  const moduleCode = `import React from "react";\n\nexport default ${code}`;

  const filePath = writeTestModule({
    componentCode: moduleCode,
    testName: "basic-render",
  });

  const moduleUrl = pathToFileURL(filePath).href;
  const Component = (await import(moduleUrl)).default;

  const { getByText } = render(<Component />);
  expect(getByText("Hello World")).toBeDefined();
});

// component/props
test.skip("injects static props into component");
test.skip("injects dynamic props from state");
test.skip("omits undefined or null props");

// component/template
test.skip("renders flat template structure");
test.skip("renders nested template structure");
test.skip("handles empty template gracefully");

// component/fragments
test.skip("renders multiple sibling fragments");
test.skip("returns root fragment without extra wrapper");

// component/states
test.skip("initializes value states properly");
test.skip("injects state values into components");
test.skip("evaluates multiple states in correct order");
