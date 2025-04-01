import { BaseControlType, mixed } from "@repo/components";
import {
  CodeComponentElementHandle,
  ComponentElementHandle,
  ElllComponentElementHandle,
  entityTypeMatch,
  entityTypes,
  Prop,
  PropConfig,
} from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { EvaluableControlEntry } from "../../../../../../components/controls/infrastructure/evaluable/evaluable";
import { useInstancesCommonReactivePair } from "../../../../../../hooks/utils/reactivity";
import { Datatype, datatypeControlMap } from "../../../../../../libs/datatypes";

function ElllPropControlEntry({
  elements,
  prop,
}: {
  elements: ComponentElementHandle[];
  prop: Prop;
}) {
  const name = useObservable(prop.name$, prop.name);
  const [_value$, _value] = useInstancesCommonReactivePair({
    instances: elements.map((h) => h.instance),
    value$: (i) => i.entity.prop$(prop.id),
    value: (i) => i.entity.prop(prop.id),
  });
  const type = useObservable(prop.datatype$, prop.datatype);

  return (
    <EvaluableControlEntry
      label={name ?? prop.id}
      control={
        datatypeControlMap[type as Datatype] ?? BaseControlType.Expression
      }
      value={_value}
      value$={_value$}
      onChange={(value) => {
        elements.forEach((element) => {
          element.entity.setProp(prop.name, value);
        });
      }}
    />
  );
}
function CodePropControlEntry({
  elements,
  name,
  config,
}: {
  elements: ComponentElementHandle[];
  name: string;
  config: PropConfig;
}) {
  const [_value$, _value] = useInstancesCommonReactivePair({
    instances: elements.map((h) => h.instance),
    value$: (i) => i.entity.prop$(name),
    value: (i) => i.entity.prop(name),
  });
  const type = config.type;

  return (
    <EvaluableControlEntry
      label={config.displayName ?? name}
      control={
        datatypeControlMap[type as Datatype] ?? BaseControlType.Expression
      }
      value={_value}
      value$={_value$}
      onChange={(value) => {
        elements.forEach((element) => {
          element.entity.setProp(name, value);
        });
      }}
    />
  );
}

export function ElllComponentPropsSheet({
  selection,
}: {
  selection: ElllComponentElementHandle[];
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
export function CodeComponentPropsSheet({
  selection,
}: {
  selection: CodeComponentElementHandle[];
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
        {props.map(([name, config]) => (
          <CodePropControlEntry
            elements={selection}
            key={name}
            name={name}
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
  selection: ComponentElementHandle[];
}): JSX.Element {
  if (
    selection.every((h) =>
      entityTypeMatch(h.entity.type, entityTypes.elements.components.elll),
    )
  ) {
    return (
      <ElllComponentPropsSheet
        selection={selection as ElllComponentElementHandle[]}
      />
    );
  } else if (
    selection.every((h) =>
      entityTypeMatch(h.entity.type, entityTypes.elements.components.code),
    )
  ) {
    return (
      <CodeComponentPropsSheet
        selection={selection as CodeComponentElementHandle[]}
      />
    );
  } else {
    return <></>;
  }
}
