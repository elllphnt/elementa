# Elementa Server

A TypeScript Node.js server for accessing Elementa Infrastructure projects and files.

## Features

- RESTful API for accessing projects and files
- Support for local storage infrastructure
- Modular architecture for easy extension
- TypeScript support with type definitions

## Installation

```bash
# Install dependencies
npm install

# or if using pnpm
pnpm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
INFRASTRUCTURE_URL=local:/path/to/your/local/directory
```

### Environment Variables

- `PORT`: The port on which the server will run (default: 3000)
- `INFRASTRUCTURE_URL`: The base URL of the Elementa Infrastructure (required)

### Infrastructure URL Format

Currently supported infrastructure types:

- **Local Storage**: `local:/path/to/directory`
  - Points to a local directory containing project folders
  - Each subdirectory represents a project
  - Files within project directories can be accessed via the API

## Usage

### Development

```bash
# Run in development mode with hot reload
npm run dev
```

### Production

```bash
# Build the project
npm run build

# Start the production server
npm start
```

## API Endpoints

### GET /projects

Returns a list of all projects in the Elementa Infrastructure.

**Response:**

```json
[
  {
    "id": "project1",
    "name": "project1"
  },
  {
    "id": "project2",
    "name": "project2"
  }
]
```

### GET /projects/:project_id

Returns the details of a specific project by its ID.

**Response:**

```json
{
  "id": "project1",
  "name": "project1"
}
```

### GET /projects/:project_id/files/:file_id

Returns metadata about a specific file in a project.

**Response:**

```json
{
  "id": "dir2%2Ffile1.txt",
  "path": "dir2/file1.txt",
  "type": "txt"
}
```

### GET /projects/:project_id/files/:file_id/content

Returns the content of a specific file in a project.

**Response:**

```json
{
  "content": "File content here..."
}
```

### GET /projects/:project_id/file?path=:file_path

Returns metadata about a specific file in a project by its path.

**Query Parameters:**

- `path`: The relative path to the file within the project

**Response:**

```json
{
  "id": "dir2%2Ffile1.txt",
  "path": "dir2/file1.txt",
  "type": "txt"
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-06-15T10:30:00.000Z"
}
```

## Directory Structure

For local storage infrastructure, organize your files as follows:

```
/path/to/infrastructure/
├── project1/
│   ├── file1.txt
│   ├── dir1/
│   │   └── file2.txt
│   └── dir2/
│       └── file3.txt
├── project2/
│   ├── README.md
│   └── src/
│       └── main.ts
└── ...
```

## File ID Encoding

File IDs are URI-encoded versions of the file path relative to the project directory:

- File path: `dir2/file1.txt`
- File ID: `dir2%2Ffile1.txt`

Project IDs are URI-encoded versions of the project directory name:

- Project directory: `project1`
- Project ID: `project1`

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing required parameters)
- `404`: Not Found (project or file doesn't exist)
- `500`: Internal Server Error

## Architecture

The server is built with a modular architecture:

- `src/types.ts`: Type definitions for projects, files, and infrastructure interface
- `src/infrastructure/`: Infrastructure implementations
  - `local-storage.ts`: Local file system infrastructure
  - `factory.ts`: Infrastructure factory for creating instances
- `src/routes/`: Express route handlers
  - `projects.ts`: Project and file API endpoints
- `src/server.ts`: Main application entry point

## Extending Infrastructure Support

To add support for new infrastructure types:

1. Create a new class implementing the `Infrastructure` interface in `src/infrastructure/`
2. Update the factory in `src/infrastructure/factory.ts` to handle the new URL scheme
3. The new infrastructure type will automatically be available to the API

Example:

```typescript
// src/infrastructure/my-infrastructure.ts
export class MyInfrastructure implements Infrastructure {
  // Implement required methods...
}

// Update factory.ts
case 'mytype:': {
  return new MyInfrastructure(url.pathname);
}
```
