import type { ComponentData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { Component } from "@elllphnt/elementa-models";
import {
  ComponentInstance,
  StaticComponentInputResolver,
} from "@elllphnt/elementa-runtime";
import { ComponentRenderable } from "@elllphnt/elementa-scene";
import { expect, test } from "@playwright/experimental-ct-react";
import { useMemo } from "react";
import type {
  TestFileData,
  TestInfrastructureData,
  TestProjectData,
} from "../infrastructure.js";
import { withTestInfrastructure } from "../lifecycle.js";
import { InfrastructureContext } from "../providers/infrastructure.js";
import { RuntimeProvider, useRuntime } from "../providers/runtime.js";
import { SceneProvider, useScene } from "../providers/scene.js";

export async function TestComponent({ component }: { component: Component }) {
  const { runtime } = useRuntime();
  const { scene } = useScene();

  const renderable = useMemo(() => {
    return new ComponentRenderable({
      scene,
      instance: new ComponentInstance({
        model: component!,
        inputResolver: new StaticComponentInputResolver({
          environment: runtime.fragmentEnvironment,
        }),
      }),
    });
  }, []);

  return <>Hello, World!</>;
}

test("hello world", async ({ mount }) => {
  const componentData: ComponentData = {
    template: {
      id: genId(),
      type: "text",
      text: "Hello, World!",
    },
  };
  const componentFileData: TestFileData = {
    id: genId(),
    path: "components/hello",
    content: JSON.stringify(componentData, null, 2),
  };
  const projectData: TestProjectData = {
    id: genId(),
    files: [componentFileData],
  };
  const infrastructureData: TestInfrastructureData = {
    projects: [projectData],
  };

  return await withTestInfrastructure(
    infrastructureData,
    async (infrastructure) => {
      const project = infrastructure.project(projectData.id);
      const modelAdaptor = project.component(componentFileData.id);
      await modelAdaptor.untilRetrieved();
      const model = modelAdaptor.model;
      expect(model, "Model should be defined");

      const dom = await mount(
        <InfrastructureContext value={infrastructure}>
          <RuntimeProvider>
            <SceneProvider>
              <TestComponent component={model!} />
            </SceneProvider>
          </RuntimeProvider>
        </InfrastructureContext>
      );
      await expect(dom.locator("text=Hello, World!")).toBeVisible();
    }
  );
});
