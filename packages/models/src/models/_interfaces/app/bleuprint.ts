import { Observable } from "rxjs";

export interface BlueprintNode {
  id: string;

  position: {
    x: number;
    y: number;
  };
  position$: Observable<{ x: number; y: number }>;

  setPosition(pos: { x: number; y: number }): void;
}

export interface AppBlueprint {
  node(id: string, create: true): BlueprintNode;
  node(id: string): BlueprintNode | undefined;
  node$(id: string, create: true): Observable<BlueprintNode>;
  node$(id: string): Observable<BlueprintNode | undefined>;

  removeNode(id: string): void;
}
