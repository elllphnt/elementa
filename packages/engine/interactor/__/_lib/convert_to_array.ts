import { ElementHandle } from "../handles/elements/element.js";

export function convertElementsToArray(element: ElementHandle) {
  // // get container
  // const container = element.parent;
  // if (!container) {
  //   return undefined;
  // }
  // // resolve destination index
  // const containerChildren = container.children;
  // const index = containerChildren.indexOf(element);
  // // create array
  // const array = new ArrayElement({
  //   component: element.entity.component,
  // });
  // // add element
  // element.entity.remove();
  // array.setElement(element.entity);
  // array.setMode("fixed");
  // array.setLength(2);
  // // add array to container
  // return container.dropEntities({ entities: [array], index })[0];
}
