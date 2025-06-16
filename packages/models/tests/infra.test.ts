import { assert, test } from "vitest";
import { InMemoryInfrastructure } from "~/index.js";

test("Project test", () => {
  const infrastructure = new InMemoryInfrastructure({
    data: {
      projects: [
        {
          id: "test-project",
          files: [
            {
              id: "test-file",
              path: "test-file.ts",
              content: "console.log('Hello, World!');",
            },
          ],
        },
      ],
    },
  });

  assert(infrastructure);
});
