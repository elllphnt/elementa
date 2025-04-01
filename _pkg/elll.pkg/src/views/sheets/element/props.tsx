import {
  DataInputConfig,
  entityTypeMatch,
  entityTypes,
} from "@elllphnt/elll-element";
import { mixed } from "@repo/components";
import {
  ComponentElementHandle,
  PrimitiveElementHandle,
} from "@repo/elementa-interactor";
import { Prop } from "@repo/elementa-models";
import { useObservable } from "@repo/utils";
import { elllControlTypes } from "~/src/components/ui/controls/_types";
import { EvaluableControlEntry } from "~/src/components/ui/controls/_uncertain/evaluable/evaluable";
import { DynamicControlEntry } from "~/src/components/ui/controls/dynamic";
import { useInstancesCommonReactivePair } from "~/src/hooks/utils/reactivity";
import { DynamicType } from "../../modals/dynamics/_dynamics";

function ElllPropControlEntry({
  elements,
  prop,
}: {
  elements: ComponentElementHandle[];
  prop: Prop;
}) {
  const identifier = useObservable(prop.identifier$, prop.identifier);
  const name = useObservable(prop.name$, prop.name);
  const [_value$, _value] = useInstancesCommonReactivePair({
    instances: elements.map((h) => h.instance),
    value$: (i) => i.entity.prop$(identifier || ""),
    value: (i) => i.entity.prop(identifier || ""),
  });
  const tsType = useObservable(prop.tsType$, prop.tsType);

  return (
    <EvaluableControlEntry
      label={name || identifier || prop.id}
      control={elllControlTypes.Typed}
      controlSettings={{
        type: tsType,
      }}
      value={_value}
      value$={_value$}
      onChange={(value) => {
        elements.forEach((element) => {
          if (prop.name) {
            element.entity.setProp(prop.name, value);
          }
        });
      }}
    />
  );
}
function PrimitivePropControlEntry({
  elements,
  identifier,
  config,
}: {
  elements: PrimitiveElementHandle[];
  identifier: string;
  config: DataInputConfig;
}) {
  const [_value$, _value] = useInstancesCommonReactivePair({
    instances: elements.map((h) => h.instance),
    value$: (i) => i.entity.prop$(identifier),
    value: (i) => i.entity.prop(identifier),
  });
  const tsType = config.tsType;

  return (
    <DynamicControlEntry
      label={config.name || identifier}
      control={elllControlTypes.Typed}
      controlSettings={{
        type: tsType,
      }}
      value={_value}
      value$={_value$}
      onChange={(value) => {
        elements.forEach((element) => {
          element.entity.setProp(identifier, value);
        });
      }}
      onRemove={() => {
        elements.forEach((element) => {
          element.entity.setProp(identifier, undefined);
        });
      }}
      dynamics={{
        [DynamicType.Expression]: true,
        [DynamicType.DriveFile]: true,
      }}
    />
  );
}

export function ComponentPropsSheet({
  selection,
}: {
  selection: ComponentElementHandle[];
}): JSX.Element {
  const [_component$, _component] = useInstancesCommonReactivePair({
    instances: selection.map((h) => h.instance),
    value$: (i) => i.entity.localComponent$,
    value: (i) => i.entity.localComponent,
  });
  const componentOrMixed = useObservable(_component$, _component);
  const isMixed = componentOrMixed === mixed;
  const component = isMixed ? undefined : componentOrMixed;
  const props = useObservable(component?.props$, component?.props) ?? [];

  let content = <></>;

  if (props.length) {
    content = (
      <>
        {props.map((prop) => (
          <ElllPropControlEntry
            elements={selection}
            key={prop.key}
            prop={prop}
          />
        ))}
      </>
    );
  } else if (component) {
    content = (
      <div className="el-p-4 el-text-fg-500 el-text-center">
        No properties available.
      </div>
    );
  } else if (isMixed) {
    content = (
      <div className="el-p-4 el-text-fg-500 el-text-center">
        Mixed components selected.
        <br /> Please select only one component to view its properties.
      </div>
    );
  } else {
    content = (
      <div className="el-p-4 el-text-fg-500 el-text-center">
        No component available.
        <br /> Please load a component to view its properties.
      </div>
    );
  }

  return <>{content}</>;
}
export function PrimitivePropsSheet({
  selection,
}: {
  selection: PrimitiveElementHandle[];
}): JSX.Element {
  const [_config$, _config] = useInstancesCommonReactivePair({
    instances: selection.map((h) => h.instance),
    value$: (i) => i.config$,
    value: (i) => i.config,
  });
  const configOrMixed = useObservable(_config$, _config);
  const isMixed = configOrMixed === mixed;
  const config = isMixed ? undefined : configOrMixed;
  const props = Object.entries(config?.props ?? {});

  let content = <></>;

  if (props.length) {
    content = (
      <>
        {props.map(([identifier, config]) => (
          <PrimitivePropControlEntry
            elements={selection}
            key={identifier}
            identifier={identifier}
            config={config}
          />
        ))}
      </>
    );
  } else if (isMixed) {
    content = (
      <div className="el-p-4 el-text-fg-500 el-text-center">
        Mixed components selected.
        <br /> Please select only one component to view its properties.
      </div>
    );
  } else {
    content = <></>;
  }

  return <>{content}</>;
}

export function PropsSheet({
  selection,
}: {
  selection: (ComponentElementHandle | PrimitiveElementHandle)[];
}): JSX.Element {
  if (
    selection.every((h) =>
      entityTypeMatch(h.entity.type, entityTypes.elements.component),
    )
  ) {
    return (
      <ComponentPropsSheet selection={selection as ComponentElementHandle[]} />
    );
  } else if (
    selection.every((h) =>
      entityTypeMatch(h.entity.type, entityTypes.elements.primitive),
    )
  ) {
    return (
      <PrimitivePropsSheet selection={selection as PrimitiveElementHandle[]} />
    );
  } else {
    return <></>;
  }
}
