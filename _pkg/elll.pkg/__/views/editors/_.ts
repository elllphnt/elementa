import { View } from "@repo/shell";
import { ElementaEditorBoardView } from "./elementa/board/board";
import { ElementaEditorContextView } from "./elementa/context";
import { ElementaEditorOutlineView } from "./elementa/outline";
import { PreviewEditorBarView } from "./preview/bar";
import { PreviewEditorBoardView } from "./preview/board";
import { ScriptrEditorBoardView } from "./scriptr/board";

export const editorViews = {
  elementaBoard: {
    id: "elll.view.elementaEditorBoard",
    render: ElementaEditorBoardView,
  },
  elementaContext: {
    id: "elll.view.elementaEditorContext",
    render: ElementaEditorContextView,
  },
  elementaOutline: {
    id: "elll.view.elementaEditorOutline",
    render: ElementaEditorOutlineView,
  },
  previewBoard: {
    id: "elll.view.previewEditorBoard",
    render: PreviewEditorBoardView,
  },
  previewBar: {
    id: "elll.view.previewEditorBar",
    render: PreviewEditorBarView,
  },
  scriptBoard: {
    id: "elll.view.scriptrEditorBoard",
    render: ScriptrEditorBoardView,
  },
} satisfies Record<string, View>;
