import { createElllInstance, ElllHost } from "@repo/elllbuild";
import "@repo/styles/dist/elll.css";
import "reactflow/dist/style.css";
import { BehaviorSubject, Observable } from "rxjs";
import { getUser, tokenManager } from "./clients";

const userId = "usr_vjls1oe9xd1zcvqvqj80chb0";

class Host implements ElllHost {
  private _userId$ = new BehaviorSubject<string | undefined>(undefined);
  private _tenantId$ = new BehaviorSubject<string | undefined>(undefined);
  private _repositoryId$ = new BehaviorSubject<string | undefined>(undefined);

  get userId(): string | undefined {
    return this._userId$.value;
  }
  get userId$(): Observable<string | undefined> {
    return this._userId$.asObservable();
  }

  get tenantId(): string | undefined {
    return this._tenantId$.value;
  }
  get tenantId$(): Observable<string | undefined> {
    return this._tenantId$.asObservable();
  }

  get repositoryId(): string | undefined {
    return this._repositoryId$.value;
  }
  get repositoryId$(): Observable<string | undefined> {
    return this._repositoryId$.asObservable();
  }

  setUserId(userId: string) {
    this._userId$.next(userId);
  }
  setTenantId(tenantId: string) {
    this._tenantId$.next(tenantId);
  }
  openProject(repositoryId: string): void {
    this._repositoryId$.next(repositoryId);
  }
  closeProject(): void {
    this._repositoryId$.next(undefined);
  }

  logout(): void {
    this._repositoryId$.next(undefined);
    this._userId$.next(undefined);
  }
}

export async function runApp() {
  const host = new Host();
  const elll = createElllInstance({
    services: {
      elllephant: {
        url: "https://api.elllephant.com",
        tokenManager: tokenManager,
      },
      room: {
        // url: "http://localhost:56633",
        url: "https://api.elllephant.com/rooms",
        tokenManager: tokenManager,
      },
      elementa: {
        editorUrl: "http://localhost:3456",
        viewerUrl: "http://localhost:7834",
      },
    },
    host,
  });

  elll.setConfig("getSuggestionQueries", async () => {
    return [
      {
        title: "Build a hero section",
        query:
          "Build a hero section with a large background image, title, subtitle, and a call-to-action button.",
      },
      {
        title: "Design a portfolio website",
        query:
          "Design a personal portfolio website with sections for projects, about, and contact.",
      },
      {
        title: "Create a task management app",
        query:
          "Create a web application for managing tasks with user authentication, a dashboard, and due date reminders.",
      },
    ];
  });

  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }

  await elll.init();
  elll.render(root);

  // elll.repository$.subscribe((repository) => {
  //   if (repository) {
  //     const key = elll.shell.showModal({
  //       viewId: "elll.views.modals.generate-project",
  //       affinity: "workspace",
  //       props: {
  //         prompt: {
  //           type: "webapp",
  //           title: "Task Management App",
  //           description:
  //             "The project is a web application designed for managing tasks efficiently. Users will have the ability to create, edit, and delete tasks, as well as categorize them based on priority and status. It will feature secure user authentication to ensure that only registered users can access their tasks. The app will include a user-friendly dashboard to view tasks at a glance, including options to filter by due dates or categories. Additionally, there will be a reminder system that notifies users of upcoming due dates, helping them stay on track with their tasks.",
  //         },
  //         onCompleted: () => {
  //           elll.shell.hideModal(key);
  //         },
  //       },
  //     });
  //   }
  // });

  await initHost(host);
}

async function initHost(host: Host) {
  host.setUserId(userId);
  const user = await getUser(userId);
  host.setTenantId(user.tenant_id);
}

(document as any).domain = "localhost";

runApp();
