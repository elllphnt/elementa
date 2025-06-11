import { FragmentInputResolver } from "../../fragment/input_resolver/input_resolver.js";
import { FragmentElementInstance } from "./fragment.js";

/**
 * Prop and slot binding resolver for fragments rendered via <FragmentElement>.
 * Pulls values directly from the FragmentElementInstance's element data model.
 */
export class FragmentElementFragmentInputResolver extends FragmentInputResolver {
  readonly fragmentElementInstance: FragmentElementInstance;

  paramValue(varName: string) {
    return this.fragmentElementInstance.element.paramValue(varName);
  }
  paramValue$(varName: string) {
    return this.fragmentElementInstance.element.paramValue$(varName);
  }

  constructor(fragmentElementInstance: FragmentElementInstance) {
    super({ environment: fragmentElementInstance.environment });
    this.fragmentElementInstance = fragmentElementInstance;
  }
}
