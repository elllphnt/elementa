import { AgentEvent, AgentMessage } from "@elllphnt/elll-acp";

function joinPath(base: string, path: string): string {
  if (!base.endsWith("/")) {
    base += "/";
  }
  if (path.startsWith("/")) {
    path = path.substring(1);
  }
  return base + path;
}

export function createAgentClient({
  baseUrl,
  getToken,
}: {
  baseUrl: string;
  getToken: () => Promise<string>;
}) {
  return {
    query: async (path: string, message: Omit<AgentMessage, "role">) => {
      return queryAgent({
        url: joinPath(baseUrl, path),
        token: await getToken(),
        message,
      });
    },
  };
}

async function* queryAgent({
  url,
  token,
  message,
}: {
  url: string;
  token: string;
  message: Omit<AgentMessage, "role">;
}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...message,
      role: "user",
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    buffer = lines.pop() || ""; // keep partial line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        yield JSON.parse(trimmed) as AgentEvent;
      } catch {
        continue;
      }
    }
  }

  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer.trim()) as AgentEvent;
    } catch {}
  }
}
