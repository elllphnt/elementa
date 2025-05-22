import { EnvironmentRoute } from "./route.js";

export type EnvironmentData = {
  moduleNames: Record<number, string>;
  classNames: Record<number, string>;
  resolvedValues: Record<number, any>;
  routes: Record<number, EnvironmentRoute>;
};

export class Environment {
  private data: EnvironmentData;

  constructor(data: EnvironmentData) {
    this.data = data;
  }

  getModuleName(key: number): string {
    return this.data.moduleNames[key];
  }

  getClassName(key: number): string {
    return this.data.classNames[key];
  }

  getResolvedValue(key: number): any {
    return this.data.resolvedValues[key];
  }

  getRoute(key: number): EnvironmentRoute {
    return this.data.routes[key];
  }
}
