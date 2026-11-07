# Elementa Studio (client)

The studio UI: a React 19 + Tailwind app for browsing compiled Elementa projects and viewing each component as code, as a live preview, or on the editable stage.

```bash
pnpm dev   # vite on :3500 (usually started via `pnpm studio` at the repo root)
```

It expects the [studio server](../studio-server) on `VITE_SERVER_URL` (default `http://localhost:3000`) and the [canvas runtime](../elementa) on `:5174`.

## Structure

| Path | Role |
| --- | --- |
| `src/backend/backend.ts` | REST client for projects, files and content |
| `src/backend/sync.ts` | Subscribes to the server's SSE stream and applies project/file/content updates |
| `src/backend/infrastructure.ts` | Adapts server files into engine `FileModelAdaptor`s backed by JSON state |
| `src/viewer/components/explorer/` | Project and file tree |
| `src/viewer/components/board/board.tsx` | Board with the **Code / Preview / Stage** selector |
| `src/viewer/components/board/code_viewer.tsx` | Monaco editor view |
| `src/viewer/components/board/elementa_viewer/` | Mounts components and routers into the canvas iframe; `component_stage.tsx` attaches the `ElementaInteractor` overlay |
| `src/viewer/components/board/inspector/` | Style adapters and per-instance diagnostics ("Problems") |
| `src/viewer/state.ts` | Shared iframe / scene-manager state |
