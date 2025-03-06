import { Workspace, WorkspaceLayout } from "@repo/shell";
import { of } from "rxjs";
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
        defaultView: boardViews.home.id,
      },
    };
  }
  get viewMap() {
    return {
      appBar: appBarViews.default.id,
      boardPlaceholder: boardViews.home.id,
    };
  }
}
