import { Tool } from "./tool.js";

export class EntityTool extends Tool {
  readonly entityType: string;

  constructor(options: { name: string; entityType: string }) {
    super({ name: options.name });
    this.entityType = options.entityType;
  }
}
