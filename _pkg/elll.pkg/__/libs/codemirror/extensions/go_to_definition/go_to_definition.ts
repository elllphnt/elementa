import {
  Decoration,
  DecorationSet,
  EditorView,
  PluginValue,
  ViewPlugin,
} from "@codemirror/view";
import { DefinitionInfo } from "typescript";
import { navigator } from "../../facets/navigator";
import { tsVirtualEnvironment } from "../../facets/ts_env";

class GoToDefinitionPlugin implements PluginValue {
  private view: EditorView;
  private ctrlKeyDown: boolean = false;
  private coordinates: { x: number; y: number } | null = null;
  private hoverPos: number | null = null;
  private decorations: DecorationSet = Decoration.none;

  constructor(view: EditorView) {
    this.view = view;

    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
    this.view.dom.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this),
    );
    this.view.dom.addEventListener("click", this.handleClick.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Control" || event.metaKey) {
      if (!this.ctrlKeyDown) {
        this.ctrlKeyDown = true;
        if (this.updateHoverPos()) {
          this.updateDecorations();
        }
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    if (event.key === "Control" || event.metaKey) {
      if (this.ctrlKeyDown) {
        this.ctrlKeyDown = false;
        this.hoverPos = null;
        this.updateDecorations();
      }
    }
  }

  private handleMouseMove(event: MouseEvent) {
    this.coordinates = { x: event.clientX, y: event.clientY };

    if (this.ctrlKeyDown && this.updateHoverPos()) {
      this.updateDecorations();
    }
  }

  private handleClick(event: MouseEvent) {
    let target: HTMLElement | null = event.target as HTMLElement;
    // find closest element with data-definition attribute
    while (target && !target.dataset.definition) {
      target = target.parentElement;
    }
    if (!target || !target.dataset.definition) {
      return;
    }

    const definition = JSON.parse(target.dataset.definition);
    this.goToDefinition(definition);
  }

  private updateHoverPos() {
    let position: number | null = null;
    if (this.coordinates) {
      position = this.view.posAtCoords(this.coordinates);
    }
    if (position !== this.hoverPos) {
      this.hoverPos = position;
      return true;
    } else {
      return false;
    }
  }

  private goToDefinition(definition: DefinitionInfo) {
    const nav = this.view.state.facet(navigator);
    const tsvfs = this.view.state.facet(tsVirtualEnvironment)?.getTsVfs();
    if (!nav || !tsvfs) {
      return;
    }

    const fileUrl = tsvfs.getFileUrl(definition.fileName);
    if (!fileUrl) {
      return;
    }

    nav(fileUrl);
  }

  private updateDecorations() {
    if (!this.ctrlKeyDown || this.hoverPos == null) {
      this.decorations = Decoration.none;
      this.view.update([]);
      return;
    }

    const env = this.view.state.facet(tsVirtualEnvironment);
    const tsEnv = env?.getEnvironment();
    const languageService = tsEnv?.languageService;
    const scriptFileName = env?.getCurrentFileName();
    if (!languageService || !scriptFileName) {
      this.decorations = Decoration.none;
      this.view.update([]);
      return;
    }

    const offset = this.hoverPos;

    const quickInfo = languageService.getQuickInfoAtPosition(
      scriptFileName,
      offset,
    );
    const definition = languageService.getDefinitionAtPosition(
      scriptFileName,
      offset,
    )?.[0];

    if (definition && quickInfo) {
      const start = quickInfo.textSpan.start;
      const end = start + quickInfo.textSpan.length;

      const deco = Decoration.mark({
        attributes: {
          "data-definition": JSON.stringify(definition),
          "style":
            "cursor: pointer; text-decoration: underline; color: #0078d4 !important;",
        },
      }).range(start, end);

      this.decorations = Decoration.set([deco]);
    } else {
      this.decorations = Decoration.none;
    }

    this.view.update([]);
  }

  // Expose decorations to the editor
  get decorationsSet() {
    return this.decorations;
  }
}

export function goToDefinitionPlugin() {
  return ViewPlugin.define(
    (view) => {
      return new GoToDefinitionPlugin(view);
    },
    {
      decorations: (plugin) => plugin.decorationsSet,
    },
  );
}
