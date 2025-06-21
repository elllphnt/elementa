# Elementa Real-time File Viewer

This is the client application for viewing and monitoring Elementa project files in real-time using Server-Sent Events (SSE).

## Features

### Real-time Updates

- **Live File Monitoring**: Automatically updates when files are added, modified, or deleted
- **Connection Status**: Visual indicators showing the real-time connection state
- **Project Synchronization**: Instantly reflects changes to project structure
- **File Content Updates**: Shows when file content has been modified

### Visual Indicators

- 🟢 **Green dot**: Connected and receiving real-time updates
- 🔴 **Red dot**: Disconnected from real-time updates
- ⚡ **Pulse animation**: Indicates recent updates
- 📡 **Live badge**: Shows when real-time monitoring is active

## Getting Started

1. **Start the server** (in `../elementa-server`):

   ```bash
   npm run dev
   ```

2. **Start the viewer**:

   ```bash
   npm run dev
   ```

3. **Test real-time updates**:
   - Open a project by clicking on it in the sidebar
   - Create, modify, or delete files in the project directory
   - Watch the viewer update automatically

## Architecture

### Client-side Components

#### SSE Client (`src/services/sse-client.ts`)

- Manages Server-Sent Events connection
- Handles reconnection with exponential backoff
- Provides type-safe event handling

#### FileSystem Context (`src/contexts/FileSystemContext.tsx`)

- Global state management for projects and files
- Integrates SSE events with local state
- Manages loading states and error handling

#### Real-time Hooks

- `useSSE`: React hook for SSE connection management
- `useFileSystem`: Hook for accessing file system state and actions

### Server-side Integration

The viewer connects to SSE endpoints provided by the elementa-server:

- `/sse/events` - Global file system events
- `/sse/projects/:projectId/events` - Project-specific events

## Configuration

### Environment Variables

- `VITE_SERVER_URL`: URL of the elementa-server (default: http://localhost:3000)

### Server Requirements

The viewer requires the elementa-server to be running with:

- File watching enabled (chokidar)
- SSE endpoints available
- CORS configured for client domain

## Real-time Event Types

### File Events

- `add`: New file created
- `change`: File content modified
- `unlink`: File deleted
- `addDir`: New directory created
- `unlinkDir`: Directory deleted

### Connection Events

- `connected`: SSE connection established
- `fileChange`: File system change occurred

## Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Troubleshooting

### Connection Issues

1. Verify the server is running on the correct port
2. Check CORS configuration in the server
3. Ensure WebSocket/SSE isn't blocked by proxy/firewall

### Missing Updates

1. Check file system permissions
2. Verify the server's file watcher is active
3. Look for errors in browser console

### Performance

- File watching uses `chokidar` with optimized settings
- Debounced updates prevent excessive notifications
- Connection monitoring with automatic reconnection
