import { createClientCredentialsTokenManager } from "@elllphnt/elll-client";
import {
  ComponentData,
  entityTypes,
  FrameWidgetData,
} from "@elllphnt/elll-element";
import { createIdentityServiceClient } from "@elllphnt/identity-service-client";
import { createRepositoryServiceClient } from "@elllphnt/repository-service-client";
import * as Figma from "figma-api";
import fsSync, { promises as fs } from "fs";
import { convertFigmaNodeToElllElement } from "./index.js";

const fileKey = "lrHHVobRo42LXEPAkz0TlK";

const tokenManager = createClientCredentialsTokenManager({
  clientId: "Soa8IJCEbI5enYjuNzQ2XNmoIUomKb9L",
  clientSecret:
    "pJCWse1FyUhfZckusD46hREM6EYGA0Jvnr4TOLK6IHLqQNgpCedRxKYZG9GGaCcs",
  audience: "https://api.elllephant.com",
  issuerUrl: "https://auth.elllephant.com",
});
const repositoryServiceClient = createRepositoryServiceClient({
  baseUrl: "https://api.elllephant.com",
  tokenManager,
});
const identityServiceClient = createIdentityServiceClient({
  baseUrl: "https://api.elllephant.com",
  tokenManager,
});

const userId = "google-oauth2|107020575315227839972";
const repositoryName = "craft";

const api = new Figma.Api({
  personalAccessToken: "figd_sPDgMIIhqRUT2RzpV3HJeRYt7aoF0XRHF3mDbre2",
});
export async function fetchGenFile() {
  const result = await api.getFile(fileKey, { depth: 1 });
  await fetchGenNode(result.document);
}

export async function fetchGenComponent(
  node: Figma.Node<"COMPONENT_SET"> | Figma.Node<"COMPONENT">,
  namespace: string
) {
  const name = node.name.replaceAll(/\W+/g, "-");
  const dirPath = `./gen/${fileKey}/components/${namespace}`;
  const filePath = `${dirPath}/${name}-${
    node.id.replaceAll(":", "-") + ".json"
  }.json`;
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(node, null, 2));
}

export async function fetchGenCanvas(node: Figma.Node<"CANVAS">) {
  const checkFilePath = `./gen/${fileKey}/canvases/${node.id.replaceAll(
    ":",
    "-"
  )}`;
  const namespace =
    node.name.replaceAll(/\W+/g, "-") + `-${node.id.replaceAll(":", "-")}`;
  if (fsSync.existsSync(checkFilePath)) {
    console.log("skipping canvas fetch", node.name);
    await genCanvas(namespace);
    return;
  }
  const data = await api.getFileNodes(fileKey, [node.id]);
  const nodeData = data.nodes[node.id];
  if (!nodeData) {
    return;
  }
  const canvas = nodeData.document as Figma.Node<"CANVAS">;
  await Promise.all(
    canvas.children.map(async (child) => {
      await fetchGenNode(child, namespace);
    })
  );

  await fs.mkdir(`./gen/${fileKey}/canvases`, { recursive: true });
  await fs.writeFile(checkFilePath, Date.now().toString());
  await genCanvas(namespace);
}

export async function fetchGenNode(
  node: Figma.Node,
  namespace: string = "root"
) {
  if (node.type === "CANVAS") {
    console.log("Found canvas:", node.name);
    return fetchGenCanvas(node as Figma.Node<"CANVAS">);
  }
  if (node.type === "COMPONENT_SET" || node.type === "COMPONENT") {
    console.log("Found component:", node.name);
    return fetchGenComponent(
      node as Figma.Node<"COMPONENT_SET"> | Figma.Node<"COMPONENT">,
      namespace
    );
  } else if ("children" in node) {
    for (const child of node.children) {
      await fetchGenNode(child, namespace);
    }
  }
}

fetchGenFile().catch(console.error);

// gen

export async function genCanvas(namespace: string) {
  const dirpath = `./gen/${fileKey}/components/${namespace}`;
  if (!fsSync.existsSync(dirpath)) {
    return;
  }
  const components = await fs.readdir(dirpath);
  await Promise.all(
    components.map(async (component) => {
      await genComponent(`${dirpath}/${component}`, namespace);
    })
  );
}
export async function genComponent(path: string, namespace: string) {
  console.log("Generating component", path);
  const data = await fs.readFile(path, "utf-8");
  const componentOrSet = JSON.parse(data) as
    | Figma.Node<"COMPONENT_SET">
    | Figma.Node<"COMPONENT">;
  let component: Figma.Node<"COMPONENT">;

  if (componentOrSet.type === "COMPONENT_SET") {
    component = componentOrSet.children.find(
      (child) => child.type === "COMPONENT"
    ) as Figma.Node<"COMPONENT">;
  } else {
    component = componentOrSet;
  }
  if (!component) {
    return;
  }

  const content = convertFigmaNodeToElllElement(component);
  if (!content) {
    return;
  }

  let name = componentOrSet.name.replaceAll(/\W+/g, "-");
  if (name.startsWith("-")) {
    name = name.slice(1);
  }
  if (name.endsWith("-")) {
    name = name.slice(0, -1);
  }

  const elllComponent: ComponentData & {
    _version: number;
  } = {
    template: {
      type: entityTypes.fragment,
      content: [content],
    },
    widgets: [
      {
        type: entityTypes.widgets.frame,
      } as FrameWidgetData,
    ],
    _version: 1,
  };

  try {
    await saveFile(
      `components/gen/${fileKey}/${namespace}/${name}`,
      JSON.stringify(elllComponent)
    );
    console.log("Saved component", name);
  } catch (e) {
    console.error(e);
    console.log("Failed to save component", name);
  }
}

let workspaceId: string | undefined = undefined;
async function getWorkspaceId(): Promise<string> {
  if (workspaceId) {
    return workspaceId;
  }

  const tenant = await getUserTenant(userId, "kervensvolcy");

  const repositoryResult = await repositoryServiceClient.get(
    "/repositories/{tenantId}/{repositoryName}",
    {
      params: {
        path: {
          tenantId: tenant.id,
          repositoryName: repositoryName,
        },
      },
    }
  );
  if (!repositoryResult.response.ok) {
    console.error(repositoryResult.error);
    throw new Error(repositoryResult.error);
  }

  const repository = repositoryResult.data!;
  if (!repository) {
    throw new Error("Repository not found");
  }

  const wsResult = await repositoryServiceClient.get("/workspaces", {
    params: {
      query: {
        repositoryId: repository.id,
      },
    },
  });

  if (!wsResult.response.ok) {
    throw new Error(wsResult.error);
  }
  const workspaces = wsResult.data!;
  if (workspaces.length === 0) {
    throw new Error("No workspace found");
  }

  workspaceId = workspaces[0].id!;

  return workspaceId;
}

async function saveFile(path: string, data: string) {
  const workspaceId = await getWorkspaceId();
  const fileRes = await repositoryServiceClient.get(
    "/workspaces/{workspaceId}/file",
    {
      params: {
        path: {
          workspaceId,
        },
        query: {
          path,
        },
      },
    }
  );

  let file = fileRes.data;

  if (!fileRes.response.ok && fileRes.response.status !== 404) {
    throw new Error(fileRes.error);
  }
  if (!file) {
    const createRes = await repositoryServiceClient.post(
      "/workspaces/{workspaceId}/files",
      {
        params: {
          path: {
            workspaceId,
          },
        },
        body: {
          path,
          type: "application/vnd.elll.component+json",
        },
      }
    );
    if (!createRes.response.ok) {
      throw new Error(createRes.error);
    }

    file = createRes.data!;
  }

  const uploadUrlRes = await repositoryServiceClient.get(
    "/workspaces/{workspaceId}/files/{fid}/signed-url",
    {
      params: {
        path: {
          workspaceId,
          fid: file.fid,
        },
        query: {
          operation: "write",
        },
      },
    }
  );

  if (!uploadUrlRes.response.ok) {
    throw new Error(uploadUrlRes.error);
  }

  const uploadUrl = uploadUrlRes.data?.url!;
  const contentType = uploadUrlRes.data?.contentType!;

  await fetch(uploadUrl, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": contentType,
    },
  });
}

export async function getUserTenant(userId: string, name: string) {
  const result = await identityServiceClient.get("/users/{userId}/tenant", {
    params: {
      path: {
        userId,
      },
      query: {
        name,
      },
    },
  });

  if (!result.response.ok) {
    throw result.error;
  }

  return result.data!;
}
