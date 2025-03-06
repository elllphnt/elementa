import { View } from "@repo/shell";
import { BlueprintBoardView } from "./editors/blueprint/blueprint_board";
import { CodeMirrorBoardView } from "./editors/codemirror/codemirror_board";
import { ComponentBoardView } from "./editors/elementa/editor/component_board";
import { ComponentViewerBoardView } from "./editors/elementa/viewer/component_board";
import { ComponentViewerBar } from "./editors/elementa/viewer/component_viewer_bar";
import { FeaturesBoardView } from "./editors/features/features_board";
import { MonacoBoardView } from "./editors/monaco/monaco_board";
import { ProgrammingInterfaceBoardView } from "./editors/programming_interface/programming_interface_board";
import { UtilitySheetBoardView } from "./editors/utility_sheet/utility_sheet_board";
import { VariableSheetBoardView } from "./editors/variable_sheet/variable_sheet_board";
import { HomeBoardView } from "./home/home_board";

export const boardViews = {
  home: {
    id: "elll.view.board.home",
    render: HomeBoardView,
  },

  // editors
  codeMirrorEditor: {
    id: "elll.view.board.editor.codemirror",
    render: CodeMirrorBoardView,
  },
  monacoEditor: {
    id: "elll.view.board.editor.monaco",
    render: MonacoBoardView,
  },
  componentEditor: {
    id: "elll.view.board.editor.component",
    render: ComponentBoardView,
  },
  componentViewer: {
    id: "elll.view.board.viewer.component",
    render: ComponentViewerBoardView,
  },
  componentViewerBar: {
    id: "elll.view.board.viewer.component.bar",
    render: ComponentViewerBar,
  },
  featuresEditor: {
    id: "elll.view.board.editor.features",
    render: FeaturesBoardView,
  },
  blueprintEditor: {
    id: "elll.view.board.editor.blueprint",
    render: BlueprintBoardView,
  },
  programmingInterfaceEditor: {
    id: "elll.view.board.editor.programming-interface",
    render: ProgrammingInterfaceBoardView,
  },
  variableSheet: {
    id: "elll.view.board.editor.variable-sheet",
    render: VariableSheetBoardView,
  },
  utilitySheet: {
    id: "elll.view.board.editor.utility-sheet",
    render: UtilitySheetBoardView,
  },
} satisfies Record<string, View>;
