import inquirer from "inquirer";
import * as yaml from "yaml";
import { fsUtils } from "../../lib/fs.js";
import { getToken } from "../../routines/auth/token.js";
import { Config } from "../../types/config.js";
import { getUser } from "../api/identity.js";
import { listTenantRepositories } from "../api/repository.js";
import { parseTokenClaims } from "../auth/token.js";

async function getRepositoryId(): Promise<string> {
  const token = await getToken(true);
  const claims = parseTokenClaims(token);
  const user = await getUser(claims.elll_id);
  if (!user) {
    throw new Error("User not found");
  }
  const repositories = await listTenantRepositories({
    tenant_id: user.tenant_id,
  });
  if (!repositories.length) {
    console.error("No repositories found in this tenant.");
    console.info("Please create a new project in the Elll web app.");
  }

  const response = await inquirer.prompt([
    {
      type: "list",
      name: "repositoryId",
      message: "Select a repository:",
      choices: repositories.map((repo) => ({
        name: repo.name,
        value: repo.id,
      })),
    },
  ]);

  return response.repositoryId;
}

export async function getDefaultConfig(
  init: Partial<Config> = {},
): Promise<Config> {
  let repositoryId: string;

  if (init.repositoryId) {
    repositoryId = init.repositoryId;
  } else {
    console.log("Retrieving repository...");
    repositoryId = await getRepositoryId();
  }

  return {
    version: "1.0",
    repositoryId,
    root: "elll",
    storage: {
      root: "storage",
    },
  };
}

function writeResourceComment({
  path,
  details,
}: {
  path?: string;
  details?: string;
}): string {
  const parts: string[] = [];

  if (path) {
    // If path includes spaces, hyphens, or quotes, wrap it in quotes and escape any existing quotes
    if (path.includes(" ") || path.includes("-") || path.includes('"')) {
      const escapedPath = path.replace(/"/g, '\\"');
      parts.push(`"${escapedPath}"`);
    } else {
      parts.push(path);
    }
  }

  if (details) {
    parts.push(details);
  }

  return parts.join(" - ");
}

function parseResourceComment(comment: string): {
  path?: string;
  details?: string;
} {
  // Trim whitespace
  comment = comment.trim();

  let path: string | undefined;
  let details: string | undefined;

  // Regular expression to match a quoted string (handles escaped quotes)
  const quotedStringRegex = /^"((?:\\.|[^"\\])*)"(?:\s+-\s+(.*))?$/s;
  const matchQuoted = comment.match(quotedStringRegex);

  if (matchQuoted) {
    // Extract path and details from quoted string
    path = matchQuoted[1].replace(/\\"/g, '"');
    details = matchQuoted[2]?.trim() || "";
  } else {
    // Split on ' - ', considering the possibility of ' - ' in details
    const separator = " - ";
    const index = comment.indexOf(separator);

    if (index !== -1) {
      // Separator found; split into path and details
      path = comment.slice(0, index).trim();
      details = comment.slice(index + separator.length).trim();
    } else {
      // No separator; determine if comment is path or details
      if (comment.includes(" ") || comment.includes("-")) {
        // Contains spaces or hyphens, consider as details
        details = comment;
      } else {
        // Consider as path
        path = comment;
      }
    }
  }

  return { path, details };
}

export async function readConfig(path: string): Promise<Config> {
  if (!(await fsUtils.exist(path))) {
    console.log("Config file not found. Creating a new one...");
    const config = await getDefaultConfig();
    await writeConfig(path, config);
    return config;
  }
  const configContent = (await fsUtils.read(path, "utf8")) ?? "";
  const parsedConfig = yaml.parseDocument(configContent);
  const config = parsedConfig.toJS() as Config;

  if (config.resources) {
    config.resources = config.resources.map((resource, index) => {
      const node = parsedConfig.getIn(["resources", index], true) as yaml.Node;
      const comment = node.commentBefore;
      const { path, details } = parseResourceComment(comment || "");
      return { ...resource, path, details };
    });
  }

  return config;
}

export async function writeConfig(path: string, config: Config) {
  const { resources, ...restConfig } = config;
  const doc = new yaml.Document(restConfig);

  if (config.resources) {
    config.resources.forEach((resource, index) => {
      const { path, details, ...restResource } = resource;
      const node = doc.createNode(restResource);
      const comment = writeResourceComment({ path, details });
      const firtSubNode = node.items[0];
      if (comment && firtSubNode) {
        firtSubNode.key.commentBefore = ` ${comment}`;
      }
      doc.setIn(["resources", index], node);
    });
  }

  await fsUtils.write(path, String(doc));
}
