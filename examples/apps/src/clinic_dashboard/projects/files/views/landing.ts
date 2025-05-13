import { ComponentData } from "@elllphnt/elementa-base";
import { InMemoryFileData } from "@elllphnt/elementa-models";
import { clinicDashboardProject } from "../../clinic_dashboard.js";

export const componentData: ComponentData = {
  template: {
    id: "template",
    content: [
      {
        id: "element_1",
        type: "text",
        text: "Welcome to the Clinic Dashboard",
        stylesheet: {
          styles: {
            __base__: {
              "height": {
                value: 100,
                unit: "px",
              },
              "color": {
                model: "rgb",
                value: [34, 100, 100],
              },
              "background-color": {
                model: "rgb",
                value: [0, 0, 0],
              },
            },
          },
        },
      },
    ],
  },
};

export const landingViewFile: InMemoryFileData = {
  id: "landing",
  projectId: clinicDashboardProject.id,
  name: "Landing",
  content: JSON.stringify(componentData, null, 2),
};
