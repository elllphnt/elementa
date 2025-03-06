import { useElementaEditor } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { TextStyleControl } from "../../_common/_fragments/text";

export function FrameTextControlSheet(): JSX.Element {
  const editor = useElementaEditor();
  const defaultPage = useObservable(editor.defaultPage$, editor.defaultPage);
  const styles = defaultPage ? [defaultPage.instance.style] : [];

  return <TextStyleControl styles={styles as any} />;
}
