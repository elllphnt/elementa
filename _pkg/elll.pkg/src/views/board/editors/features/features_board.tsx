import { SpecEditorState } from "~/src/editors/spec";
import { FeaturesEditorView } from "./editor";

export function FeaturesBoardView({
  editor,
}: {
  editor: SpecEditorState;
}): JSX.Element {
  return <FeaturesEditorView spec={editor.spec} />;
}
