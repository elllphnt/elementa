import type { SlotFill } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { ComponentInputResolver } from "../../component/input_resolver/input_resolver.js";
import type { ComponentElementInstance } from "./component.js";

/**
 * Prop and slot binding resolver for components rendered via <ComponentElement>.
 * Pulls values directly from the ComponentElementInstance's element data model.
 */
export class ComponentElementComponentPropResolver extends ComponentInputResolver {
  readonly componentElementInstance: ComponentElementInstance;

  get props() {
    return this.componentElementInstance.element.props;
  }
  get props$() {
    return this.componentElementInstance.element.props$;
  }

  slotFill(id: string): SlotFill | undefined {
    return this.componentElementInstance.element.fill(id);
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return this.componentElementInstance.element.fill$(id);
  }

  constructor(componentElementInstance: ComponentElementInstance) {
    super({ environment: componentElementInstance.environment });
    this.componentElementInstance = componentElementInstance;
  }
}
