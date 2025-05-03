import { ComponentData } from "@elllphnt/elementa-base";
import {
  attachComponent,
  attachValueState,
  InMemoryInfrastructure,
  InMemoryProject,
} from "@elllphnt/elementa-models";
import {
  ComponentInstance,
  DefaultFragmentEnvironment,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
  StaticComponentPropResolver,
} from "@elllphnt/elementa-runtime";
import { isFromEnhancer, updateYMap } from "@elllphnt/elementa-utils";
import { render, screen } from "@testing-library/react";
import * as y from "yjs";
import { Scene } from "../src";
import ComponentComponent from "../src/components/component/component";
import { ComponentRenderable } from "../src/renderables/component/component";
import { DomStyleSheetManager } from "../src/style/_";

function createRenderableComponent({
  component: componentData,
  props,
}: {
  component: ComponentData;
  props?: Record<string, unknown>;
}) {
  // Infra
  const infrastructure = new InMemoryInfrastructure();
  const moduleHost = new InMemoryModuleHost();
  const moduleManager = new ModuleManager({
    infrastructure,
    moduleHost,
    externals: ["react", "react-dom"],
  });
  const runtime = new Runtime({ moduleManager });
  const scene = new Scene({ stylesheetManager: new DomStyleSheetManager() });
  const environment = new DefaultFragmentEnvironment({ runtime });
  const project = new InMemoryProject({ id: "test", infrastructure });

  // Component

  const ydoc = new y.Doc();
  const propResolver = new StaticComponentPropResolver({ environment, props });
  const component = ydoc.getMap("component");
  updateYMap(component, componentData);
  assert(attachComponent(component, project));

  const componentRenderable = new ComponentRenderable({
    scene,
    instance: new ComponentInstance({
      propResolver,
      component,
    }),
  });

  return componentRenderable;
}

test("component template", async () => {
  const component = createRenderableComponent({
    component: {
      template: {
        id: "template",
        content: [
          {
            id: "text",
            type: "text",
            text: "Hello world",
          },
        ],
      },
    },
  });
  render(<ComponentComponent component={component} />);
  expect(screen.getByText("Hello world")).toBeInTheDocument();
});

test("component props", async () => {
  const component = createRenderableComponent({
    component: {
      props: [
        {
          name: "Text",
          varName: "text",
        },
      ],
      template: {
        id: "template",
        content: [
          {
            id: "text",
            type: "text",
            text: "{{ props.text }}",
          },
        ],
      },
    },
    props: {
      text: "Hello world",
    },
  });
  render(<ComponentComponent component={component} />);
  expect(screen.getByText("Hello world")).toBeInTheDocument();
});

test("component states", async () => {
  const component = createRenderableComponent({
    component: {
      states: [
        {
          id: "text_state",
          type: "value",
          varName: "text",
          init: "Hello world",
        },
      ],
      template: {
        id: "template",
        content: [
          {
            id: "text",
            type: "text",
            text: "{{ states.text.value }}",
          },
        ],
      },
    },
  });
  assert.equal(component.instance.component.states.length, 1);
  const state = component.instance.component.states.get(0);

  assert.equal(state.type, "value");
  assert.equal(state.varName, "text");
  assert.equal(state.type, "value");

  assert(isFromEnhancer(state, attachValueState));
  assert.equal(state.init, "Hello world");

  const environment = component.instance.template.environment;
  assert.equal(environment.states.length, 1);
  const stateInstance = environment.states[0];
  assert.equal(stateInstance.model, state);

  render(<ComponentComponent component={component} />);

  const namespace = environment.namespace;
  assert.equal(namespace.get("states.text.value"), "Hello world");

  expect(screen.getByText("Hello world")).toBeInTheDocument();
});

test.skip("component fragments", async () => {});
