import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import {
  ExpressionControl,
  FullControlEntry,
  TextControl,
} from "@repo/components";
import {
  ModuleStateInstance,
  StateInstance,
  ValueStateInstance,
} from "@repo/elementa";
import { SchemaControl } from "~/src/views/modals/state/schema";

export function ValueStateView({ state }: { state: ValueStateInstance }) {
  return (
    <div
      style={{
        width: 240,
      }}
      className="el-space-y-1"
    >
      <FullControlEntry label="Name">
        <TextControl
          value={state.entity.name}
          value$={state.entity.name$}
          onChange={(value) => state.entity.setName(value)}
        />
      </FullControlEntry>
      <FullControlEntry label="Schema">
        <SchemaControl
          value={state.entity.schema}
          value$={state.entity.schema$}
          onChange={(value) => state.entity.setSchema(value)}
        />
      </FullControlEntry>
      <FullControlEntry label="Initial Value">
        <ExpressionControl
          value={state.entity.initialValue}
          value$={state.entity.initialValue$}
          onChange={(value) => state.entity.setInitialValue(value)}
        />
      </FullControlEntry>
    </div>
  );
}

export function ModuleStateView({ state }: { state: ModuleStateInstance }) {
  return (
    <div
      style={{
        width: 240,
      }}
    >
      <FullControlEntry label="Name"></FullControlEntry>
    </div>
  );
}

export function StateView({ state }: { state: StateInstance }) {
  return switchEntityType(
    state.entity.type,
    {
      [entityTypes.states.value]: () => (
        <ValueStateView state={state as ValueStateInstance} />
      ),
      [entityTypes.states.module]: () => (
        <ModuleStateView state={state as ModuleStateInstance} />
      ),
    },
    () => (
      <>
        <div>Unknown state type: {state.entity.type}</div>
      </>
    ),
  );
}
