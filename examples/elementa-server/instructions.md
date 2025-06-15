Generate in this directory a ts node server.

The server should be configurable with an .env file with the following variables:

- PORT: The port on which the server will run (default: 3000)
- INFRASTRUCTURE_URL: The base URL of the Elementa Infrastructure (required)

The api should have the following endpoints:

- GET /projects: Returns a list of all projects in the Elementa Infrastructure.
- GET /projects/:project_id: Returns the details of a specific project by its ID.
- GET /projects/:project_id/files?path=:path_prefix,depth=:depth: Returns a list of files in a specific project, optionally filtered by path prefix and depth.
- GET /projects/:project_id/files/:file_id: Returns metadata about a specific file in a project.
- GET /projects/:project_id/files/:file_id/content: Returns the content of a specific file in a project.
- GET /projects/:project_id/file?path=:file_path: Returns metadata about a specific file in a project by its path.

## Concepts

- In Elementa, an infrastructure is a collection of projects. And a project is a collection of files.
- A project metadata is as follows:

```ts
type ProjectData = {
  id: string;
  name: string;
};
```

- A file metadata is as follows:

```ts
type FileData = {
  id: string;
  path: string;
  type: string;
};
```

- The content is always a string.

## Implementation

The current implementation will only support one type of infrastructure: local storage.
The url scheme for local storage is as follows: `local:{{path/to/the/root/directory}}`
The directory of a local storage infrastructure has the following structure:

```
{{path/to/the/root/directory}}/
  ├── project1/
  │   ├── file1.txt
  │   └── file2.txt
  ├── project2/
  │   ├── file1.txt
  │   └── file2.txt
  └── ...
```

The path of the files is relative to the project directory, so for example, if the file is located at `project1/dir2/file1.txt`, the path in the metadata will be `dir2/file1.txt`.

The id of a file in a local storage infrastructure is obtained by URI encoding the file the metadata path. For example, if the file path is `dir2/file1.txt`, the id will be `encodeUriComponent(dir2/file1.txt)`.

The id of a project in a local storage infrastructure is obtained by URI encoding the project directory name. For example, if the project directory is `project1`, the id will be `encodeUriComponent(project1)`.

Use the `fs` module to read the files and directories and return the metadata and content as specified in the endpoints.

Make the system modular, so that it can be easily extended to support other types of infrastructures in the future.

## Stack

- Node.js
- TypeScript
- Express.js
- dotenv
  use `tsx` to run the server
