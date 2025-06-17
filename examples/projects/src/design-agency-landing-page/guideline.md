## Environment

You are operating in a TypeScript-React project with a clearly defined architecture. The application is composed of:

- A single JSON router file containing all routing logic in a declarative format
- A modular set of resource files that work together to define the application's behavior and UI

### Resource Types

The following resource types are supported:

- **Component**: A React component file that exports a single default component. Components are UI-only and must not include internal state. All state logic is externalized via hooks. Use components for views, layouts, and other UI elements.
- **Hook**: A React hook file that exports a single default hook. Hooks contain logic and side effects but no UI.
- **Context**: A React context file that exports a single default context. No additional exports are allowed.
- **Loader**: A TypeScript module exporting a single default function. Loaders are used to fetch or prepare data before rendering a route.
- **Handler**: A TypeScript module exporting a single default function. Handlers process API requests and are attached to API routes.
- **Script**: An arbitrary TypeScript module used for utility functions, constants, and types. Can export multiple named elements.
- **Markdown**: A `.md` file used for documentation, such as README files or content pages.

When referencing files, always apply the following suffixes to clarify their type:

- `.component.tsx` → Component (component, view, layout, etc.)
- `.hook.ts` → Hook
- `.context.ts` → Context
- `.loader.ts` → Loader
- `.handler.ts` → Handler
- `.css` → Stylesheet
- `.ts` → Script
- `.json` → Json
- `.md` → Markdown

Use these suffixes in all file paths, responses, and tool instructions.

All import paths must be **absolute** and start from the root of the workspace. Avoid relative imports such as `"../../utils"`.

### Routing Structure

All routing logic resides in a single JSON file following a TanStack-style schema. Each route entry can have:

- **path** (optional): The route's URL path (e.g., "/home")
- **children** (optional): An array of nested routes
- **component** (optional): Path to the component rendered for the route
- **pendingComponent** (optional): Path to the loading component
- **errorComponent** (optional): Path to the error fallback component
- **notFoundComponent** (optional): Path to the not-found fallback component
- **loader** (optional): Path to the loader function
- **handler** (optional): Path to the handler function (for API routes)

All paths are absolute, meaning they begin with a "/" and are resolved from the root of the workspace.

Example (for a page route):

```json
{
  "path": "/home",
  "component": "/views/home/home.component.tsx",
  "loader": "/views/home/home.loader.ts"
}
```

### Styling

All styles must be defined in seperate `.css` files and imported into the corresponding component files.
All elements must be styled via their unique IDs. Use clsx and className to conditionally apply styles based on props and state.

Example:

```css
/* home.component.css */
#root {
  /* Base style for the root element */
}
#root.active {
  /* Style for the active state */
}
```

```tsx
import React from "react";
import clsx from "clsx";
import "./button.component.css";

export interface ButtonProps {
  active?: boolean; // Optional prop to indicate if the button is active
  // Define any props needed for the button component
}

const ButtonComponent: React.FC = ({ active }: ButtonProps) => {
  return (
    <button id="root" classname={clsx({ active })}>
      {/* Content for the button */}
    </button>
  );
};
export default ButtonComponent;
```

## Guidelines

- Be consistent with the modular architecture and separation of concerns
- Always use absolute import paths in code
