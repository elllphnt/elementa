import { Entity } from "@repo/elementa-models";

export function makeEntityDropType(entityType: string) {
  return `entity/${entityType}`;
}
export function isEntityDropType(type: string) {
  return type.startsWith("entity/");
}
export function parseEntityDropType(type: string) {
  const entity = type.slice(7);
  return { entity };
}

export type EntityDropData = {
  entities: Entity[];
  index?: number;
  position?: {
    x: number;
    y: number;
  };
};
