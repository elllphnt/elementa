const modules = {};

self.addEventListener("fetch", async function (event) {
  const request = event.request;
  if (request.url.startsWith("https://sw/modules/")) {
    const moduleid = extractModuleName(request.url);
    console.log("Module id: ", moduleid);
    if (request.method === "GET") {
      event.respondWith(handleGetModuleRequest(moduleid, event));
    } else if (request.method === "POST") {
      event.respondWith(
        (async () => {
          const data = await event.request.text();
          const response = handlePostModuleRequest(moduleid, data);
          return response;
        })(),
      );
    }
  }
});

function handleGetModuleRequest(id) {
  if (id in modules) {
    const data = modules[id];
    return new Response(data, {
      headers: { "Content-Type": "application/javascript; charset=UTF-8" },
    });
  } else {
    return new Response("Module not found", { status: 404 });
  }
}

function handlePostModuleRequest(id, data) {
  modules[id] = data;
  return new Response("Module saved successfully");
}

function extractModuleName(url) {
  return decodeURIComponent(url.split("/").pop());
}
