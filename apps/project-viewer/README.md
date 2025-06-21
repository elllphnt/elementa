# Elementa Viewer

A React-based viewer application for exploring Elementa infrastructure projects and files.

## Features

- **Project Explorer**: Browse projects in a collapsible tree structure
- **File Navigation**: Navigate through project directories and files
- **File Viewer**: Display file information and API URLs (content fetching not yet implemented)
- **Modern UI**: Clean and responsive interface using Tailwind CSS

## Prerequisites

Before running the Elementa Viewer, you need to have the Elementa Server running. See the `elementa-server` example for implementation details.

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
VITE_SERVER_URL=http://localhost:3000
```

Where `VITE_SERVER_URL` is the base URL of your running Elementa Server.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

## Usage

1. **Browse Projects**: The sidebar shows all available projects from the Elementa infrastructure
2. **Expand Projects**: Click on a project to load and view its file structure
3. **Navigate Files**: Click on directories to expand them and view their contents
4. **View Files**: Click on a file to view its information in the main area

## Architecture

The viewer is built with:

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- Modular component architecture

### Key Components

- `App.tsx`: Main application component that manages state
- `Sidebar.tsx`: Left sidebar for project and file navigation
- `FileViewer.tsx`: Main content area for displaying file information
- `TreeView.tsx`: Reusable tree component for hierarchical navigation
- `api.ts`: API client for communicating with the Elementa Server

## API Integration

The viewer communicates with the Elementa Server using these endpoints:

- `GET /projects`: Fetch all projects
- `GET /projects/:project_id/files`: Fetch files in a project
- `GET /projects/:project_id/files/:file_id/content`: Get file content (URL displayed, not fetched)

## Future Enhancements

- Implement actual file content fetching and display
- Add syntax highlighting for code files
- Support for file search and filtering
- File editing capabilities
- Multiple infrastructure support

## Development

To extend the viewer:

1. Add new components in the `src/components/` directory
2. Update types in `src/types.ts` as needed
3. Modify the API client in `src/api.ts` for new endpoints
4. Use the existing tree structure for consistent navigation

## Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
