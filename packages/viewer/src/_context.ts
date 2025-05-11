import { Infrastructure } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "@elllphnt/elementa-runtime";
import { Scene } from "@elllphnt/elementa-scene";

export class ViewerContext {
  infrastructure: Infrastructure;
  scene: Scene;
  environment: FragmentEnvironment;

  constructor({
    infrastructure,
    scene,
    environment,
  }: {
    infrastructure: Infrastructure;
    scene: Scene;
    environment: FragmentEnvironment;
  }) {
    this.infrastructure = infrastructure;
    this.scene = scene;
    this.environment = environment;
  }
}
