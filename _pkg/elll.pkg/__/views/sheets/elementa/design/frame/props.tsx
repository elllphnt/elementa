import { BaseControlType, mixed } from "@repo/components";
import { FrameWidgetHandle, Prop } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { EvaluableControlEntry } from "../../../../../components/controls/infrastructure/evaluable/evaluable";
import { useInstancesCommonReactivePair } from "../../../../../hooks/utils/reactivity";
import { Datatype, datatypeControlMap } from "../../../../../libs/datatypes";

function ElllPropControlEntry({
  frames,
  prop,
}: {
  frames: FrameWidgetHandle[];
  prop: Prop;
}) {
  const name = useObservable(prop.name$, prop.name);
  const [_value$, _value] = useInstancesCommonReactivePair({
    instances: frames.map((h) => h.instance),
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
        frames.forEach((element) => {
          element.entity.setProp(prop.id, value);
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
