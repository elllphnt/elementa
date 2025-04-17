import { View } from "@repo/shell";
import { keys } from "~/src/libs/keys";
import { BlueprintBoardView } from "./editors/blueprint/blueprint_board";
import { BriefBoardView } from "./editors/brief/brief_board";
import { ComponentBoardView } from "./editors/elementa/editor/component_board";
import { ComponentViewerBoardView } from "./editors/elementa/viewer/component_board";
import { ComponentViewerBar } from "./editors/elementa/viewer/component_viewer_bar";
import { MonacoBoardView } from "./editors/monaco/monaco_board";
import { ProgrammingInterfaceBoardView } from "./editors/programming_interface/programming_interface_board";
import { UtilitySheetBoardView } from "./editors/utility_sheet/utility_sheet_board";
import { VariableSheetBoardView } from "./editors/variable_sheet/variable_sheet_board";
import { HomeBoardView } from "./home/home_board";

export const boardViews = {
  home: {
    id: keys.views.board.home,
    render: HomeBoardView,
  },

  // editors
  monacoEditor: {
    id: keys.views.board.monacoEditor,
    render: MonacoBoardView,
  },
  componentEditor: {
    id: keys.views.board.componentEditor,
    render: ComponentBoardView,
  },
  componentViewer: {
    id: keys.views.board.componentViewer,
    render: ComponentViewerBoardView,
  },
  componentViewerBar: {
    id: keys.views.board.componentViewerBar,
    render: ComponentViewerBar,
  },
  featuresEditor: {
    id: keys.views.board.briefEditor,
    render: BriefBoardView,
  },
  blueprintEditor: {
    id: keys.views.board.blueprintEditor,
    render: BlueprintBoardView,
  },
  programmingInterfaceEditor: {
    id: keys.views.board.programmingInterfaceEditor,
    render: ProgrammingInterfaceBoardView,
  },
  variableSheet: {
    id: keys.views.board.variableSheet,
    render: VariableSheetBoardView,
  },
  utilitySheet: {
    id: keys.views.board.utilitySheet,
    render: UtilitySheetBoardView,
  },
} satisfies Record<string, View>;
