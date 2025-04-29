import { baseSelector, ComponentData } from "@elllphnt/elementa-base";
import { test } from "uvu";
import assert from "uvu/assert";
import * as y from "yjs";
import {
  createContainerElement,
  createDataInput,
  createFragment,
  createHookState,
  createMediaElement,
  createPrimitiveElement,
  createSlotElement,
  createTextElement,
  createValueState,
  createVectorElement,
  Project,
} from "../src";
import { attachComponent } from "../src/component/component";
import { createComponentElement } from "../src/component/elements/component/component";

test("component instanciation", () => {
  const doc = new y.Doc();
  const component = attachComponent(doc.getMap(), {} as Project, {
    url: "test",
  });
  assert.equal(component.url, "test");
});

test("component fields", () => {
  const doc = new y.Doc();
  const component = attachComponent(doc.getMap(), {} as Project, {
    url: "test",
  });
  component.name = "testComponent";

  assert.equal(component.toJSON().name, "testComponent");
});

test("component template", () => {
  const doc = new y.Doc();
  const component = attachComponent(doc.getMap(), {} as Project, {
    url: "test",
  });
  component.template.content.push([createContainerElement(component)]);
  assert.equal(component.template.content.length, 1);
});

test("element types", () => {
  const doc = new y.Doc();
  const component = attachComponent(doc.getMap(), {} as Project, {
    url: "test",
  });

  const componentElement = createComponentElement(component);
  const containerElement = createContainerElement(component);
  const primitiveElement = createPrimitiveElement(component);
  const textElement = createTextElement(component);
  const mediaElement = createMediaElement(component);
  const slotElement = createSlotElement(component);
  const vectorElement = createVectorElement(component);

  component.template.content.push([
    componentElement,
    containerElement,
    primitiveElement,
    textElement,
    mediaElement,
    slotElement,
    vectorElement,
  ]);

  assert.equal(component.template.content.length, 7);
  assert.equal(componentElement.type, "component");
  assert.equal(containerElement.type, "container");
  assert.equal(primitiveElement.type, "primitive");
  assert.equal(textElement.type, "text");
  assert.equal(mediaElement.type, "media");
  assert.equal(slotElement.type, "slot");
  assert.equal(vectorElement.type, "vector");
});

test("component states, props, fragments", () => {
  const doc = new y.Doc();
  const component = attachComponent(doc.getMap(), {} as Project, {
    url: "test",
  });

  const hookState = createHookState(component);
  const valueState = createValueState(component);
  const dataInput = createDataInput(component);
  const fragment = createFragment(component);

  component.states.push([hookState, valueState]);
  component.props.push([dataInput]);
  component.fragments.push([fragment]);

  assert.equal(component.states.length, 2);
  assert.equal(component.props.length, 1);
  assert.equal(component.fragments.length, 1);
});

test("element stylesheet", () => {
  const doc = new y.Doc();
  const component = attachComponent(doc.getMap(), {} as Project, {
    url: "test",
  });

  const element = createContainerElement(component);
  component.template.content.push([element]);

  const style = element.cssStyleSheet.stylesheet.style(baseSelector, true);
  style.set("align-items", "center");
  style.set("height", {
    value: 100,
    unit: "px",
  });
  const data: ComponentData = component.toJSON();
  assert.equal(
    data.template.content[0].stylesheet.styles[baseSelector]["align-items"],
    "center"
  );
  assert.equal(
    data.template.content[0].stylesheet.styles[baseSelector]["height"],
    {
      value: 100,
      unit: "px",
    }
  );
});
