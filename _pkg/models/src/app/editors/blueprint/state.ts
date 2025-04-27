import { BlueprintAppStateData } from "@elllphnt/elementa-base";
import { CRDTModelMap, MapCRDTModel } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { BlueprintNode } from "./node";

export class BlueprintAppState extends MapCRDTModel<BlueprintAppStateData> {
  readonly nodes: CRDTModelMap<BlueprintNode>;

  constructor(ymap: y.Map<any>) {
    super(ymap);

    this.nodes = new CRDTModelMap<BlueprintNode>(
      this.getOrCreateMap("nodes"),
      (node) => new BlueprintNode(node)
    );
  }
}
