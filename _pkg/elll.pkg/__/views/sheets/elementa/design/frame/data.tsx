import {
  BaseControlType,
  elllIcons16,
  FullControlEntry,
  mixed,
  SelectControl,
  useAction,
} from "@repo/components";
import { createSchema, FragmentParam, FrameWidgetHandle } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useCallback, useState } from "react";
import { EvaluableControlEntry } from "../../../../../components/controls/infrastructure/evaluable/evaluable";
import { useInstancesCommonReactivePair } from "../../../../../hooks/utils/reactivity";

function ElllFragmentDataControlEntry({
  frames,
  param,
}: {
  frames: FrameWidgetHandle[];
  param: FragmentParam;
}) {
  const name = useObservable(param.name$, param.name);
  const [_value$, _value] = useInstancesCommonReactivePair({
    instances: frames.map((h) => h.instance),
    value$: (i) => i.entity.prop$(param.key),
    value: (i) => i.entity.prop(param.key),
  });
  const schema = useObservable(param.schema$, param.schema);

  return (
    <EvaluableControlEntry
      onRemove={() => {
        frames.forEach((element) => {
          element.fragment?.entity.removeParam(param);
          element.entity.setProp(param.key, undefined);
        });
      }}
      label={name ?? param.key}
      control={BaseControlType.Expression}
      value={_value}
      value$={_value$}
      onChange={(value) => {
        frames.forEach((element) => {
          element.entity.setProp(param.key, value);
        });
      }}
    />
  );
}

export function AddFragmentParamAction({ onAdd }: { onAdd: () => void }) {
  useAction(
    {
      title: "Add Param",
      icon: elllIcons16.plus,
      handler: onAdd,
    },
    [],
  );

  return <></>;
}

export function NewFragmentParamEntry({
  onCompleted,
  onCancel,
}: {
  onCompleted?: ({ name, type }: { name: string; type: string }) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("string");

  const handleComplete = useCallback(async () => {
    onCompleted?.({ name, type });
  }, [name]);

  return (
    <FullControlEntry
      onRemove={onCancel}
      label={
        <input
          autoFocus
          type="text"
          value={name}
          style={{
            width: "100%",
            outline: "none",
          }}
          placeholder="Name"
          onChange={(e) => {
            setName(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleComplete();
            }
          }}
        />
      }
      action={
        name
          ? {
              label: "Create",
              icon: elllIcons16.plus,
              handler: handleComplete,
            }
          : undefined
      }
    >
      <SelectControl
        value={type}
        onChange={(value) => {
          setType(value ?? "string");
        }}
        settings={{
          options: [
            { value: "string", label: "String" },
            { value: "number", label: "Number" },
            { value: "boolean", label: "Boolean" },
            { value: "tuple", label: "Tuple" },
            { value: "object", label: "Object" },
            { value: "array", label: "Array" },
          ],
        }}
      />
    </FullControlEntry>
  );
}

export function FrameComponentDataSheet({
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
  const params =
    useObservable(fragment?.entity.params$, fragment?.entity.params) ?? [];
  const [adding, setAdding] = useState(false);

  let content = <></>;

  if (isMixed) {
    content = (
      <div className="el-p-4 el-text-fg-500 el-text-center">
        Mixed fragments selected.
        <br /> Please select only one fragment to view its data.
      </div>
    );
  } else if (!fragment) {
    content = (
      <div className="el-p-4 el-text-fg-500 el-text-center">
        No fragment available.
        <br /> Please load a fragment to view its data.
      </div>
    );
  } else {
    content = (
      <>
        {params.map((param) => (
          <ElllFragmentDataControlEntry
            frames={selection}
            key={param.key}
            param={param}
          />
        ))}

        <AddFragmentParamAction
          onAdd={() => {
            setAdding(true);
          }}
        />

        {adding && (
          <NewFragmentParamEntry
            onCompleted={({ name, type }) => {
              setAdding(false);
              if (!name) {
                return;
              }
              const param = new FragmentParam({});
              const schema = createSchema({ type });
              param.setName(name);
              param.setSchema(schema);
              fragment.entity.addParam(param);
            }}
            onCancel={() => {
              setAdding(false);
            }}
          />
        )}
      </>
    );
  }

  return <>{content}</>;
}
