import { Observable, of } from "rxjs";
import { Handle } from "../_types/_.js";
import { ElementaInteractor } from "../_types/interactor.js";
import { handleTypes } from "./_libs/types.js";

export class FallbackHandle extends Handle {
  constructor({
    interactor,
    parent,
  }: {
    interactor: ElementaInteractor;
    parent: Handle | null;
  }) {
    super({
      interactor,
      id: "fallback",
      type: handleTypes.fallback,
      allowedDropTypes: [
        // makeEntityDropType(entityTypes.element),
        // makeEntityDropType(entityTypes.state),
        // makeEntityDropType(entityTypes.widget),
        "text/plain",
      ],
      parent,
    });

    // context menu event listener
    // this.addEventListener("contextmenu", (event) => {
    //   event.preventDefault();

    //   if (!this.selected) {
    //     this.select();
    //   }

    //   const position = this.editor.stager.viewport.viewportToContent({
    //     x: event.clientX,
    //     y: event.clientY,
    //   });

    //   const options: ContextMenuOption[][] = [];

    //   if (
    //     this.editor.property(elementaEditorProperties.mode) ===
    //     ElementaEditorMode.Flow
    //   ) {
    //     options.push([
    //       {
    //         label: "Add Repeat Transformer",
    //         action: () => {
    //           const component = this.editor.component;
    //           if (!component) return;
    //           const transformer = new RepeatTransformer({
    //             component: this.entity.component,
    //           });
    //           transformer.setCount(3);
    //           component.addTransformer(transformer);

    //           const controller = new RepeatTransformerControllerWidget({
    //             component: this.entity.component,
    //           });
    //           controller.setTargetId(transformer.id);
    //           controller.setX(position.x);
    //           controller.setY(position.y);
    //           component.addWidget(controller);
    //         },
    //       },
    //       {
    //         label: "Add Map Transformer",
    //         action: () => {
    //           const component = this.editor.component;
    //           if (!component) return;
    //           const transformer = new MapTransformer({
    //             component: this.entity.component,
    //           });
    //           component.addTransformer(transformer);

    //           const controller = new MapTransformerControllerWidget({
    //             component: this.entity.component,
    //           });
    //           controller.setTargetId(transformer.id);
    //           controller.setX(position.x);
    //           controller.setY(position.y);
    //           component.addWidget(controller);
    //         },
    //       },
    //       {
    //         label: "Add Switch Transformer",
    //         action: () => {
    //           const component = this.editor.component;
    //           if (!component) return;
    //           const transformer = new SwitchTransformer({
    //             component: this.entity.component,
    //           });
    //           component.addTransformer(transformer);

    //           const controller = new SwitchTransformerControllerWidget({
    //             component: this.entity.component,
    //           });
    //           controller.setTargetId(transformer.id);
    //           controller.setX(position.x);
    //           controller.setY(position.y);
    //           component.addWidget(controller);
    //         },
    //       },
    //       {
    //         label: "Add Conditional Transformer",
    //         action: () => {
    //           const component = this.editor.component;
    //           if (!component) return;
    //           const transformer = new ConditionalTransformer({
    //             component: this.entity.component,
    //           });
    //           component.addTransformer(transformer);

    //           const controller = new ConditionalTransformerControllerWidget({
    //             component: this.entity.component,
    //           });
    //           controller.setTargetId(transformer.id);
    //           controller.setX(position.x);
    //           controller.setY(position.y);
    //           component.addWidget(controller);
    //         },
    //       },
    //     ]);
    //   }

    //   this.editor.host.showContextMenu(
    //     {
    //       x: event.clientX,
    //       y: event.clientY,
    //     },
    //     options,
    //   );
    // });
  }

  get children(): Handle[] {
    return [];
  }
  get children$(): Observable<Handle[]> {
    return of([]);
  }

  // handleEntityDrop(entities: Entity[], options?: DropOptions): Handle[] {
  //   const handles = entities
  //     .map((entity) => {
  //       return switchEntityType(entity.type, {
  //         [entityTypes.widget]: () => {
  //           const component = this.interactor.stager.elementa.component;
  //           if (!component) return;
  //           const widget = entity as Widget;
  //           widget.setX(options?.position?.x ?? 0);
  //           widget.setY(options?.position?.y ?? 0);
  //           component.addWidget(widget);
  //           return this.entityHandle(widget);
  //         },
  //         [entityTypes.element]: () => {
  //           const element = entity as Element;
  //           const component = this.interactor.stager.elementa.component;
  //           if (!component) return;
  //           // create fragment
  //           const fragment = new Fragment({
  //             component,
  //           });
  //           fragment.appendElements(element);
  //           component.addFragment(fragment);

  //           // create frame
  //           const frame = new FrameWidget({
  //             component,
  //           });
  //           frame.setFragmentId(fragment.id);
  //           frame.setX(options?.position?.x ?? 0);
  //           frame.setY(options?.position?.y ?? 0);
  //           component.addWidget(frame);

  //           return this.entityHandle(frame);
  //         },
  //       });
  //     })
  //     .filter(Boolean) as Handle[];

  //   return handles;
  // }

  delete(): void {
    console.warn("Cannot delete fallback handle");
  }
}
