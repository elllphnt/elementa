import {
  baseSelector,
  ContainerElementData,
  entityTypes,
  TextElementData,
} from "@elllphnt/elll-element";
import { elllFileTypes, switchFileType } from "@elllphnt/utils";
import { File } from "@repo/backend";
import { filter, firstValueFrom } from "rxjs";
import { ComponentModel, componentModelConstructor } from "../models/component";
import { IElll } from "../types/elll";

export async function initFile(elll: IElll, file: File) {
  if (!file.type) {
    console.error("File not loaded with type");
    return;
  }

  await switchFileType(file.type, {
    [elllFileTypes.components.elll]: async () => {
      const model = elll.modelManager.getModel(
        componentModelConstructor.name,
        file.url,
      ) as ComponentModel;
      await firstValueFrom(model.loaded$.pipe(filter(Boolean)));
      model.restore({
        template: {
          type: entityTypes.fragment,
          content: [
            {
              type: entityTypes.elements.container,
              styles: {
                [baseSelector]: {
                  "display": "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  "gap-x": 10,
                },
              },
              children: [
                {
                  type: entityTypes.elements.container,
                  styles: {
                    [baseSelector]: {
                      background: {
                        type: "color",
                        color: {
                          r: 0,
                          g: 0,
                          b: 255,
                          a: 1,
                        },
                      },
                      height: 100,
                      width: 100,
                    },
                    hover: {
                      "background": {
                        type: "color",
                        color: {
                          r: 255,
                          g: 0,
                          b: 0,
                          a: 1,
                        },
                      },
                      "border-top-left-radius": 100,
                      "border-top-right-radius": 100,
                      "border-bottom-left-radius": 100,
                      "border-bottom-right-radius": 100,
                    },
                  },
                },
                {
                  type: entityTypes.elements.text,
                  content: "Hello, World!",
                } as TextElementData,
              ],
            } as ContainerElementData,
          ],
          page: {
            type: entityTypes.elements.page,
            styles: {
              [baseSelector]: {
                "background": {
                  type: "color",
                  color: {
                    r: 25,
                    g: 0,
                    b: 67,
                    a: 1,
                  },
                },
                "display": "flex",
                "flex-direction": "column",
                "align-items": "center",
                "justify-content": "center",
                "gap-y": 10,
              },
              hover: {
                background: {
                  type: "color",
                  color: {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 1,
                  },
                },
              },
            },
          },
        },
        widgets: [
          {
            type: entityTypes.widgets.frame,
          },
        ],
      });
    },
  });
}
