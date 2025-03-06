export const elementControlPanels = {
  general: () => "general",
  style: (selector: string) => `style:${selector}`,
  codeComponentStylesheet: (name: string) => `stylesheet:${name}`,
  animation: (id: string) => `animation:${id}`,
};

export const activeControlPanelKey = "elementa.context.properties.activePanel";
