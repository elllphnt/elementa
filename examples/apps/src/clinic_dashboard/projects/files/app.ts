import { AppData } from "@elllphnt/elementa-base";
import { InMemoryFileData } from "@elllphnt/elementa-models";
import { clinicDashboardProject } from "../clinic_dashboard.js";

export const appData: AppData = {
  routes: [
    {
      id: "root",
      path: "/",
      mainViewUrl: "file:landing",
      children: [
        {
          id: "login",
          path: "login",
          mainViewUrl: "file:login",
        },
        {
          id: "register",
          path: "register",
          mainViewUrl: "file:register",
        },
        {
          id: "book",
          path: "book",
          mainViewUrl: "file:appointment_request",
          loaderUrl: "file:appointment_request_loader",
        },
        {
          id: "account",
          path: "account",
          mainViewUrl: "file:patient_account",
          loaderUrl: "file:patient_account_loader",
        },
        {
          id: "admin",
          path: "admin",
          mainViewUrl: "file:admin_layout",
          children: [
            {
              id: "admin_dashboard",
              path: "dashboard",
              mainViewUrl: "file:dashboard",
              loaderUrl: "file:dashboard_loader",
            },
            {
              id: "admin_patients",
              path: "patients",
              mainViewUrl: "file:patient_list",
              loaderUrl: "file:patient_list_loader",
              children: [
                {
                  id: "admin_patient_profile",
                  path: ":id",
                  mainViewUrl: "file:patient_profile",
                  loaderUrl: "file:patient_profile_loader",
                },
              ],
            },
            {
              id: "admin_appointments",
              path: "appointments",
              mainViewUrl: "file:appointment_list",
              loaderUrl: "file:appointment_list_loader",
            },
            {
              id: "admin_staff",
              path: "staff",
              mainViewUrl: "file:staff_list",
              loaderUrl: "file:staff_loader",
            },
            {
              id: "admin_settings",
              path: "settings",
              mainViewUrl: "file:settings",
              loaderUrl: "file:settings_loader",
            },
          ],
        },
      ],
    },
  ],
  providers: [],
  editors: {},
};

export const appFile: InMemoryFileData = {
  id: "app",
  projectId: clinicDashboardProject.id,
  name: "app",
  type: "app",
  content: JSON.stringify(appData, null, 2),
};
