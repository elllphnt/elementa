import { ComponentData } from "@elllphnt/elementa-base";
import { test } from "vitest";
import { transpileComponent } from "../src/index.js";
import { TestTranspilerContext, writeTestModule } from "./_utils.js";

// Simple test component

test("should render transpiled component correctly", async () => {
  const component: ComponentData = {
    template: {
      id: "root",
      content: [
        {
          id: "slot-1",
          type: "slot",
          mode: "outlet",
        },
        {
          id: "slot-2",
          type: "slot",
          mode: "fill",
        },
      ],
    },
  };

  const context = new TestTranspilerContext();
  const result = transpileComponent(component, context);
  const code = result.generate(await context.resolveEnvironment());

  const moduleCode = `import React from "react";\n\nexport default ${code}`;

  writeTestModule({
    componentCode: moduleCode,
    testName: "outlet-render",
  });
});

// routing/links
test.skip("renders router link with dynamic route");
test.skip("renders external link with absolute href");
test.skip("supports opening links in new tab");

// routing/outlet
test.skip("renders outlet for child route content");
test.skip("handles nested outlet placement correctly");
test.skip("does not break rendering when outlet is missing");
