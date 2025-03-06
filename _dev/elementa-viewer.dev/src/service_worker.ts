export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const currentRegistration =
      await navigator.serviceWorker.getRegistration("/sw.js");
    if (currentRegistration) {
      console.log("Service Worker already registered");
      return;
    }

    navigator.serviceWorker.register("/sw.js").then(
      function (registration) {
        console.log(
          "Service Worker registered with scope:",
          registration.scope,
        );
      },
      function (err) {
        console.log("Service Worker registration failed:", err);
      },
    );
  }
}
