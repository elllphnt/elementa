import { useElementaEditor } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { EditorOwnControlType } from "../../../../../components/controls/control_map";
import { InstanceStyleControlEntry } from "../../../../../components/controls/infrastructure/style/instance_style";

export function ProjectRootStyleBodySheet(): JSX.Element {
  const editor = useElementaEditor();
  const defaultPage = useObservable(editor.defaultPage$, editor.defaultPage);
  const styles = defaultPage ? [defaultPage.instance.rootStyle] : [];

  return (
    <>
      <InstanceStyleControlEntry
        property="background"
        name="Background"
        styles={styles as any}
        control={EditorOwnControlType.Fill}
        controlSettings={{
          title: "Background",
        }}
      />
    </>
  );
}
