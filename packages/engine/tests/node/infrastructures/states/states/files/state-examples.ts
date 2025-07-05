import type { ComponentData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";

export const stateExamplesData: ComponentData = {
  name: "StateExamples",
  states: [
    // Value state with primitive
    {
      id: genId(),
      name: "counter",
      type: "value",
      init: 0,
      tsType: "number",
    },
    // Value state with object
    {
      id: genId(),
      name: "user",
      type: "value",
      init: {
        name: "John Doe",
        email: "john@example.com",
        isActive: true,
      },
      tsType: "{ name: string; email: string; isActive: boolean }",
    },
    // Value state with array
    {
      id: genId(),
      name: "todos",
      type: "value",
      init: [
        { id: 1, text: "Learn Elementa", completed: false },
        { id: 2, text: "Build awesome apps", completed: false },
      ],
      tsType: "Array<{ id: number; text: string; completed: boolean }>",
    },
    // Hook state for data fetching
    {
      id: genId(),
      name: "apiData",
      type: "hook",
      hookUrl: "useApiData",
      args: {
        endpoint: "/api/users",
        refetchInterval: 5000,
      },
    },
    // Hook state with dependencies
    {
      id: genId(),
      name: "filteredTodos",
      type: "hook",
      hookUrl: "useFilteredTodos",
      args: {
        todos: { __expression: "state.todos" },
        filter: { __expression: "state.filter" },
      },
    },
    // Inline state (computed)
    {
      id: genId(),
      name: "completedCount",
      type: "inline",
      script: "state.todos.filter(todo => todo.completed).length",
    },
    // Inline state with complex computation
    {
      id: genId(),
      name: "userDisplayName",
      type: "inline",
      script:
        "state.user.isActive ? `${state.user.name} (Active)` : state.user.name",
    },
    // Filter state for todo filtering
    {
      id: genId(),
      name: "filter",
      type: "value",
      init: "all",
      tsType: "'all' | 'active' | 'completed'",
    },
  ],
  template: {
    id: genId(),
    type: "container",
    content: [
      {
        id: genId(),
        type: "text",
        text: "State Management Examples",
      },
      {
        id: genId(),
        type: "container",
        content: [
          {
            id: genId(),
            type: "text",
            text: { __expression: "`Counter: ${state.counter}`" },
          },
          {
            id: genId(),
            type: "text",
            text: { __expression: "`User: ${state.userDisplayName}`" },
          },
          {
            id: genId(),
            type: "text",
            text: {
              __expression:
                "`Completed todos: ${state.completedCount} of ${state.todos.length}`",
            },
          },
        ],
      },
      {
        id: genId(),
        type: "container",
        content: [
          {
            id: genId(),
            type: "text",
            text: { __expression: "`Filter: ${state.filter}`" },
          },
          {
            id: genId(),
            type: "text",
            text: {
              __expression:
                "state.apiData ? 'API data loaded' : 'Loading API data...'",
            },
          },
        ],
      },
      {
        id: genId(),
        type: "expression",
        expression:
          "state.filteredTodos && state.filteredTodos.length > 0 ? 'Has filtered todos' : 'No filtered todos'",
      },
    ],
  },
};

export const stateExamplesFileData: TestFileData = {
  id: genId(),
  path: "state-examples",
  content: JSON.stringify(stateExamplesData, null, 2),
};
