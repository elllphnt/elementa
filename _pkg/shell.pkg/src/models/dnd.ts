import type { Backend, DragDropManager, Unsubscribe } from "dnd-core";
import { HTML5Backend } from "react-dnd-html5-backend";

export class ElllDnDBackend implements Backend {
  private manager: DragDropManager;
  private backends: Map<Window, Backend> = new Map();

  constructor({
    manager,
    context,
  }: {
    manager: DragDropManager;
    context?: Window;
  }) {
    this.manager = manager;
    if (context) {
      this.addBackend(context);
    }
  }

  setup(): void {
    for (const [window, backend] of this.backends.entries()) {
      if (!(window.document.body as any).__isReactDndBackendSetUp) {
        backend.setup();
      }
    }
  }
  teardown(): void {
    for (const backend of this.backends.values()) {
      backend.teardown();
    }
  }
  connectDragSource(sourceId: any, node?: Node, options?: any): Unsubscribe {
    if (!node) {
      throw new Error("node must be defined");
    }
    const backend = this.getBackend(node);
    if (!backend) {
      console.error("backend not found");
      return () => {};
    }

    return backend.connectDragSource(sourceId, node, options);
  }
  connectDragPreview(sourceId: any, node?: any, options?: any): Unsubscribe {
    if (!node) {
      throw new Error("node must be defined");
    }
    const backend = this.getBackend(node);
    if (!backend) {
      console.error("backend not found");
      return () => {};
    }

    return backend.connectDragPreview(sourceId, node, options);
  }
  connectDropTarget(targetId: any, node?: any, options?: any): Unsubscribe {
    if (!node) {
      throw new Error("node must be defined");
    }
    const backend = this.getBackend(node);
    if (!backend) {
      console.error("backend not found");
      return () => {};
    }
    return backend.connectDropTarget(targetId, node, options);
  }
  profile(): Record<string, number> {
    return {};
  }
  private getBackend(node: Node): Backend | undefined {
    const window = node.ownerDocument?.defaultView;
    if (!window) {
      console.error("window not found");
      return undefined;
    }
    let backend = this.backends.get(window);
    if (!backend) {
      backend = this.addBackend(window);
    }
    return backend;
  }

  addBackend(window: Window) {
    if (this.backends.has(window)) {
      return this.backends.get(window) as Backend;
    }
    const backend = HTML5Backend(this.manager, window, {
      rootElement: window.document.body,
    });
    this.backends.set(window, backend);
    backend.setup();
    return backend;
  }
  removeBackend(window: Window): void {
    const backend = this.backends.get(window);
    if (!backend) {
      return;
    }
    backend.teardown();
    this.backends.delete(window);
  }
}

export function ElllDnDBackendFactory(
  manager: DragDropManager,
  context?: Window,
): Backend {
  return new ElllDnDBackend({ manager, context });
}
