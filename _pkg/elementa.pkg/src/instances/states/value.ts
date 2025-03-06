import { ValueState } from "@repo/elementa-models";
import { Elementa } from "../../elementa";
import { Instance } from "../instance";
import { StateInstance } from "./state";

export class ValueStateInstance extends StateInstance<ValueState> {
  constructor({
    entity,
    elementa,
    parent,
  }: {
    entity: ValueState;
    elementa: Elementa;
    parent: Instance | null;
  }) {
    super({ entity, elementa, parent });
  }
}
