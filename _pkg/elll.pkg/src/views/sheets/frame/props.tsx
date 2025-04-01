import { mixed } from "@repo/components";
import { FrameWidgetHandle } from "@repo/elementa-interactor";
import { Prop } from "@repo/elementa-models";
import { useObservable } from "@repo/utils";
import { elllControlTypes } from "~/src/components/ui/controls/_types";
import { EvaluableControlEntry } from "~/src/components/ui/controls/_uncertain/evaluable/evaluable";
import { useInstancesCommonReactivePair } from "~/src/hooks/utils/reactivity";

function ElllPropControlEntry({
  frames,
  prop,
}: {
  frames: FrameWidgetHandle[];
  prop: Prop;
}) {
  const name = useObservable(prop.name$, prop.name);
  const identifier = useObservable(prop.identifier$, prop.identifier);
  const [_value$, _value] = useInstancesCommonReactivePair({
    instances: frames.map((h) => h.instance),
    value$: (i) => i.entity.prop$(identifier || ""),
    value: (i) => i.entity.prop(identifier || ""),
  });
  const type = useObservable(prop.tsType$, prop.tsType);

  return (
    <EvaluableControlEntry
      label={name || identifier || prop.id}
      control={elllControlTypes.Typed}
      controlSettings={{
        type,
      }}
      value={_value}
      value$={_value$}
      onChange={(value) => {
        frames.forEach((element) => {
          if (prop.name) {
            element.entity.setProp(prop.name, value);
          }
        });
      }}
    />
  );
}

export function FrameComponentPropsSheet({
  selection,
}: {
  selection: FrameWidgetHandle[];
}): JSX.Element {
  const [_fragment$, _fragment] = useInstancesCommonReactivePair({
    instances: selection.map((h) => h.instance),
    value$: (i) => i.fragment$,
    value: (i) => i.fragment,
  });
  const fragmentOrMixed = useObservable(_fragment$, _fragment);
  const isMixed = fragmentOrMixed === mixed;
  const fragment = isMixed ? undefined : fragmentOrMixed;
  const props =
    useObservable(fragment?.environment.props$, fragment?.environment.props) ??
    [];

  let content = <></>;

  if (props.length) {
    content = (
      <>
        {props.map((prop) => (
          <ElllPropControlEntry frames={selection} key={prop.key} prop={prop} />
        ))}
      </>
    );
  } else if (fragment) {
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
