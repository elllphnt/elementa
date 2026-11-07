# Elementa canvas runtime

The page the studio loads in its iframe (`http://localhost:5174/editor`). It has no UI of its own. It exposes `window.init({ infrastructure })`, which wires up the engine:

- a `ModuleManager` with an in-memory module host, which evaluates user component modules in the browser
- a `Runtime`, which instantiates models
- a `Scene` with a `DomStyleSheetManager`, which renders to React DOM and keeps element styles in sync
- an `ElementaRenderableManager` mounted on `#root`

The host shares its own React instance with the evaluated modules: it builds an ES module that re-exports `window.React`, turns it into a Blob URL, and maps the bare `react` specifier to that URL through the module manager's import map. User code and the scene then share one React instance, so hooks and context work across the boundary.

```bash
pnpm dev   # vite on :5174 (usually started via `pnpm studio` at the repo root)
```
