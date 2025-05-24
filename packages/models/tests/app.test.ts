import { AppData } from "@elllphnt/elementa-base";
import { test } from "vitest";
import { AppModel } from "~/index.js";

test("App serialize and deserialize properly", async () => {
  const app = new AppModel({
    init: {
      editors: {
        blueprint: {
          nodes: [
            {
              id: "route_1",
              data: {},
              position: {
                x: 0,
                y: 0,
              },
            },
            {
              id: "route_2",
              data: {},
              position: {
                x: 0,
                y: 0,
              },
            },
          ],
        },
      },
      routes: [
        {
          id: "route_1",
          path: "/",
          mainViewUrl: "file:l6lvskpfhm0p0mf353jrloks",
          children: [],
        },
        {
          id: "route_2",
          path: "/api",
          handlerUrl: "file:f6q6xuuwnvle0l7juv3hir6q",
          children: [],
        },
      ],
    },
  });

  const data1: AppData[] = [];
  const data2: AppData[] = [];
  app.data$.subscribe((d) => data1.push(d));
  app.data$.subscribe((d) => data2.push(d));
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log({ data1, data2 });
});
