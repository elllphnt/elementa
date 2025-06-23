# Incremental Build System

This directory contains an incremental build system that tracks file modification times to avoid unnecessary rebuilds.

## How it works

### Cache System (`_cache.ts`)

- **`IncrementalCache`**: Manages build cache stored in `.build-cache.json` files
- Tracks source file modification times and output file modification times
- Compares timestamps to determine if a rebuild is needed
- Automatically handles cache updates after successful builds

### Build Process (`parse.ts`)

- **`parseAll()`**: Builds all files in a project, with optional incremental support
- **`parseFile()`**: Builds a single file, checking cache if provided
- **`clearCache()`**: Utility to clear cache for a specific output directory
- **`parseAllForce()`**: Force rebuild all files (ignoring cache)

### Builder Integration (`builder.ts`)

- **`run()`**: Main entry point with incremental build support
- **`incremental`** parameter (default: `true`): Enable/disable incremental builds
- **`force`** parameter (default: `false`): Clear cache before building
- **`clearAllCaches()`**: Clear caches for all projects

## Usage

### Normal incremental build

```typescript
await run({
  projectsDir: "./projects",
  infraDir: "./infra",
  incremental: true, // default
});
```

### Force rebuild (clear cache first)

```typescript
await run({
  projectsDir: "./projects",
  infraDir: "./infra",
  force: true,
});
```

### Disable incremental builds

```typescript
await run({
  projectsDir: "./projects",
  infraDir: "./infra",
  incremental: false,
});
```

## Cache Storage

- Cache files are stored as `.build-cache.json` in each project's output directory
- Contains mapping of source file paths to modification timestamps
- Automatically cleaned up when source files are deleted (in watch mode)

## Performance Benefits

- **Skip unchanged files**: Only rebuild files that have been modified
- **Fast subsequent builds**: Dramatically faster rebuilds after initial build
- **Automatic cleanup**: Cache is maintained automatically
- **Watch mode compatibility**: File watchers always rebuild changed files regardless of cache

## Cache Behavior

1. **First build**: All files are built, cache is populated
2. **Subsequent builds**: Only modified files are rebuilt
3. **File changes**: In watch mode, changed files are always rebuilt
4. **File deletions**: Cache entries are automatically cleaned up
5. **Force rebuild**: Cache is cleared before building
