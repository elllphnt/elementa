import { CommandHandler } from "~/_types/managers/command";

export const createComponent: CommandHandler = async (interactor) => {
  // const component = interactor.stager.component;
  // const project = component?.project;
  // if (!project || !component) return;
  // const selection = interactor.interactionManager.selection.filter(
  //   (instance) => instance instanceof ElementHandle,
  // ) as ElementHandle[];
  // if (selection.length === 0) return;
  // const parent = selection[0].parent;
  // if (!parent) return;
  // const contentRect = Rect.union(
  //   selection
  //     .map((e) => e.contentRect)
  //     .filter((rect) => rect.height || rect.width), // filter out zero size rects
  // );
  // // create component from selection
  // const newComponent = await project.componentStore.createComponent();
  // if (!newComponent) return;
  // newComponent.restore({
  //   template: {
  //     type: entityTypes.fragment,
  //     content: selection.map((handle) => handle.entity.definitionData),
  //   },
  //   widgets: [
  //     {
  //       type: entityTypes.widgets.frame,
  //       x: 0,
  //       y: 0,
  //       width: Math.round(contentRect.width),
  //       height: Math.round(contentRect.height),
  //       style: {
  //         "layout": "flex",
  //         "flex-direction": "column",
  //         "justify-content": "center",
  //         "align-items": "center",
  //       },
  //     } as FrameWidgetData,
  //   ],
  // });
  // // create component element
  // const componentElement = new ElllComponentElement({
  //   component,
  // });
  // componentElement.setComponentUrl(newComponent.url);
  // // apply style
  // if (selection.length === 1) {
  //   const stylesheet = selection[0].entity.stylesheet;
  //   componentElement.stylesheet.restore(stylesheet.data);
  // }
  // // get destination index
  // let index = parent.children.indexOf(selection[0]);
  // if (index === -1) {
  //   console.warn("Failed to find index of selected element");
  //   index = parent.children.length;
  // }
  // // remove selected elements
  // selection.forEach((instance) => {
  //   instance.entity.remove();
  //   instance.entity.dispose();
  // });
  // // add component element to parent
  // parent.dropEntities({ entities: [componentElement], index });
  // // select component element
  // selection[0].fragment.handleOf(componentElement)?.select();
};

export const detachComponent: CommandHandler = (interactor) => {
  // const component = interactor.elementa.component;
  // if (!component) return;
  // const componentInstances = interactor.interactionManager.selection.filter(
  //   (instance) => instance instanceof ElllComponentElementHandle,
  // ) as ElllComponentElementHandle[];
  // if (componentInstances.length === 0) return;
  // componentInstances.forEach((instance) => {
  //   const componentElement = instance.entity as ElllComponentElement;
  //   const container = componentElement.container;
  //   const component = instance.entity.localComponent;
  //   if (!component || !container) return;
  //   // create new elements from template
  //   const newElements = component.template.content.map((element) => {
  //     const data = element.definitionData;
  //     const newElement = component.createEntity(data) as Element;
  //     newElement.restore(data);
  //     return newElement;
  //   });
  //   // get destination index
  //   let index = container.content.indexOf(componentElement);
  //   if (index === -1) {
  //     console.warn("Failed to find index of selected element");
  //     index = container.content.length;
  //   }
  //   // remove component element
  //   componentElement.remove();
  //   componentElement.dispose();
  //   // add new elements
  //   componentElement.container?.insertElements(index, ...newElements);
  // });
  // interactor.interactionManager.clearSelection();
};
