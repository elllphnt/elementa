import { elllFileTypes } from "@elllphnt/utils";
import { filter, firstValueFrom, timeout } from "rxjs";
import { ComponentModel, componentModelConstructor } from "../models/component";
import { elllFileAtPath$ } from "../modules/elementa/_utils";
import { View } from "../modules/elementa/blueprint/view";
import { ElllElementaProject } from "../modules/elementa/project/project";

const viewPath = (id: string) => `views/${id}`;

export async function buildView({
  project,
  view,
}: {
  project: ElllElementaProject;
  view: View;
}) {
  const file$ = elllFileAtPath$(project.elll, viewPath(view.id), {
    type: elllFileTypes.components.elll,
  });

  const file = await firstValueFrom(file$.pipe(filter(Boolean), timeout(5000)));
  const model = project.elll.modelManager.getModel(
    componentModelConstructor.name,
    file.url,
  ) as ComponentModel;

  // const data = {
  //   type: view.type,
  //   name: view.name,
  //   description: view.description,
  //   sections: view.componentIds.map((id) => {
  //     const component = project.blueprint.component(id);
  //     if (!component) {
  //       console.warn(`Component ${id} not found`);
  //       return;
  //     }

  //     return {
  //       id: component.id,
  //       name: component.name,
  //       description: component.description,
  //     };
  //   }),
  // };

  // const layout = await layoutView({
  //   view: data as any,
  //   client: getElllephantApiClient(project.elll),
  // });
  // await model.content.untilLoaded();
  // applyLayoutToComponent({ component: model, layout });
}

// function applyLayoutToComponent({
//   component,
//   layout,
// }: {
//   component: ElementaComponent;
//   layout: Layout;
// }) {
//   const viewport = new FrameViewport({ component });
//   viewport.update({
//     width: layout.viewport.width,
//     height: layout.viewport.height,
//   });
//   const frame = component.createWidget({
//     type: entityTypes.widgets.frame,
//   }) as FrameWidget;
//   frame.setViewport(viewport);
//   component.addWidget(frame);

//   component.template.setContent([
//     layoutAreaToElement({ area: layout.content, component }),
//   ]);
// }

// function layoutAreaToElement({
//   area,
//   component,
// }: {
//   component: ElementaComponent;
//   area: StackArea | SectionArea;
// }) {
//   let element: Element;
//   if (area.type === "stack") {
//     element = component.createElement({
//       type: entityTypes.elements.container,
//     });
//     const style = element.stylesheet.style(baseSelector, true);
//     style.setProperty("display", "flex");
//     if (area.direction === "row") {
//       style.setProperty("flex-direction", "row");
//     } else {
//       style.setProperty("flex-direction", "column");
//     }

//     const children = area.children.map((child) =>
//       layoutAreaToElement({ area: child, component }),
//     );
//     (element as ContainerElement).setContent(children);
//   } else {
//     element = component.createElement({
//       type: entityTypes.elements.components.elll,
//     });
//   }

//   element.setName(area.name);

//   const style = element.stylesheet.style(baseSelector, true);
//   style.setProperty("background", {
//     type: "color",
//     color: {
//       r: Math.floor(Math.random() * 255),
//       g: Math.floor(Math.random() * 255),
//       b: Math.floor(Math.random() * 255),
//       a: 1,
//     },
//   });
//   if (typeof area.width === "object") {
//     style.setProperty("width", area.width);
//   } else if (area.width === "fit-content") {
//     style.setProperty("width", "fit");
//   }

//   if (typeof area.height === "object") {
//     style.setProperty("height", area.height);
//   } else if (area.height === "fit-content") {
//     style.setProperty("height", "fit");
//   }

//   return element;
// }
