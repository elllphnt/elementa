import type { ComponentData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";

export const dashboardData: ComponentData = {
  name: "DashboardPage",
  props: [
    {
      name: "userId",
      tsType: "string",
      required: true,
    },
  ],
  states: [
    {
      id: genId(),
      name: "userData",
      type: "hook",
      hookUrl: "useUser",
      args: { userId: { __expression: "props.userId" } },
    },
    {
      id: genId(),
      name: "isLoading",
      type: "value",
      init: true,
      tsType: "boolean",
    },
  ],
  template: {
    id: genId(),
    type: "container",
    content: [
      {
        id: genId(),
        type: "text",
        text: { __expression: "`Dashboard for user: ${props.userId}`" },
      },
      {
        id: genId(),
        type: "expression",
        expression: "state.isLoading ? 'Loading user data...' : ''",
      },
      {
        id: genId(),
        type: "expression",
        expression:
          "!state.isLoading && state.userData ? `Welcome, ${state.userData.name}!` : ''",
      },
    ],
  },
};

export const dashboardFileData: TestFileData = {
  id: genId(),
  path: "dashboard",
  content: JSON.stringify(dashboardData, null, 2),
};
