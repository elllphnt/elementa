import { Workspace, WorkspaceLayout } from "@repo/shell";
import { of } from "rxjs";
import { keys } from "~/src/libs/keys";
import { appBarViews } from "../views/app_bar/_";
import { boardViews } from "../views/board/_";

export class HomeWorkspace extends Workspace {
  get contexts() {
    return [];
  }
  get contexts$() {
    return of([]);
  }

  get layout(): WorkspaceLayout {
    return {
      appBar: true,
      board: {
        defaultView: keys.views.board.home,
      },
    };
  }
  get viewMap() {
    return {
      appBar: appBarViews.default.id,
      boardPlaceholder: keys.views.board.home,
    };
  }
}
