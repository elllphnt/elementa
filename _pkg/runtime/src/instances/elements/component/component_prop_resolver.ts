import { SlotFill } from "@elllphnt/elementa-models";
import { Observable } from "rxjs";
import { ComponentPropResolver } from "../../component/prop_resolver/prop_resolver";
import { ComponentElementInstance } from "./component";

/**
 * Prop and slot binding resolver for components rendered via <ComponentElement>.
 * Pulls values directly from the ComponentElementInstance's element data model.
 */
export class ComponentElementComponentPropResolver extends ComponentPropResolver {
  readonly componentElementInstance: ComponentElementInstance;

  propValue(varName: string) {
    return this.componentElementInstance.element.prop(varName);
  }
  propValue$(varName: string) {
    return this.componentElementInstance.element.prop$(varName);
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
