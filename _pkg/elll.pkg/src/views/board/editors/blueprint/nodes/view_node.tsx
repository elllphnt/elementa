import { useManyObservables, useObservable } from "@repo/utils";
import { useState } from "react";
import { NodeProps } from "reactflow";
import { buildView } from "~/src/commands/build_view";
import { useElllProject } from "~/src/hooks/project/project";
import { useEditorBlueprint } from "../_context";

export function ViewNode({ data: view }: NodeProps<View>) {
  const project = useElllProject();
  const blueprint = useEditorBlueprint();
  const name = useObservable(view.name$, view.name);
  const description = useObservable(view.description$, view.description);
  const type = useObservable(view.type$, view.type);
  const componentIds = useObservable(view.componentIds$, view.componentIds);
  const components = useManyObservables(
    componentIds.map((id) => blueprint.component$(id)),
    componentIds.map((id) => blueprint.component(id)),
  ).filter(Boolean) as Component[];
  const [building, setBuilding] = useState(false);

  return (
    <div style={{ width: 200 }} className="el-bg-100 el-border el-rounded">
      <div className="el-p-2 el-space-y-1">
        <p className="el-font-semibold">{name}</p>
        <p>{type}</p>
        <p className="el-text-sm el-text-fg-400">{description}</p>
      </div>

      <div className="el-p-2 el-bg-200 el-rounded-b">
        {components.map((component) => (
          <ComponentCard key={component.id} component={component} />
        ))}
      </div>

      <button
        className="el-bg-300 el-rounded-t el-p-1 el-w-full"
        onClick={() => {
          setBuilding(true);
          buildView({
            project,
            view,
          }).finally(() => setBuilding(false));
        }}
      >
        Build
      </button>

      {building ? <div>Building...</div> : null}
    </div>
  );
}

function ComponentCard({ component }: { component: Component }) {
  const name = useObservable(component.name$, component.name);
  const description = useObservable(
    component.description$,
    component.description,
  );

  return (
    <div className="el-bg-100 el-border el-rounded el-p-2 el-space-y-1">
      <p className="el-font-semibold">{name}</p>
      <p className="el-text-sm el-text-fg-400">{description}</p>
    </div>
  );
}
