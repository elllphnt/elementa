import type {
  Component,
  ContainerElement,
  MediaElement,
  TextElement,
  VectorElement,
} from "@elllphnt/elementa-models";
import { afterAll, afterEach, assert, beforeAll, describe, test } from "vitest";
import { complexInfrastructureData } from "../infrastructures/complex/infrastructure.js";
import { mediaInfrastructureData } from "../infrastructures/media/infrastructure.js";
import { mixedInfrastructureData } from "../infrastructures/mixed/infrastructure.js";
import { statesInfrastructureData } from "../infrastructures/states/infrastructure.js";
import { stylingInfrastructureData } from "../infrastructures/styling/infrastructure.js";
import {
  setupLifecycleTracking,
  teardownLifecycleTracking,
  validateLifecycleCleanup,
  withTestInfrastructure,
} from "../lifecycle.js";

beforeAll(() => {
  setupLifecycleTracking();
});

afterAll(() => {
  teardownLifecycleTracking();
});

afterEach(() => {
  // Validate that tests properly disposed all lifecycle instances
  validateLifecycleCleanup();
});

describe("Complex Infrastructure Tests", () => {
  test("Complex App with Multiple Routes and Components", async () => {
    await withTestInfrastructure(
      complexInfrastructureData,
      async (infrastructure) => {
        const project = infrastructure.project("complex");
        assert(project, "Project should exist");

        await project.app.untilRetrieved();
        const app = project.app.model;
        assert(app, "App should be loaded");

        // Test router setup
        const routerAdaptor = app.router;
        assert(routerAdaptor, "Router adaptor should exist");

        await routerAdaptor.untilRetrieved();
        const router = routerAdaptor.model;
        assert(router, "Router should be loaded");
        assert.equal(router.routes.length, 4, "Should have 4 routes");

        // Test home route
        const homeRoute = router.routes[0];
        assert(homeRoute, "Home route should exist");
        assert.equal(homeRoute.path, "/", "Home route should be root path");

        const homeComponentAdaptor = homeRoute.mainViewComponent;
        await homeComponentAdaptor?.untilRetrieved();
        const home = homeComponentAdaptor?.model as Component;
        assert(home, "Home component should be loaded");
        assert.equal(
          home.name,
          "HomePage",
          "Home component should have correct name"
        );

        // Test component props and states
        assert(home.props, "Home component should have props");
        assert.equal(home.props.length, 1, "Should have 1 prop");
        assert.equal(
          home.props[0].name,
          "title",
          "Prop should be named 'title'"
        );

        assert(home.states, "Home component should have states");
        assert.equal(home.states.length, 1, "Should have 1 state");
        assert.equal(
          home.states[0].name,
          "counter",
          "State should be named 'counter'"
        );

        // Test template structure
        assert(home.template, "Home component should have template");
        assert.equal(
          home.template.type,
          "container",
          "Template should be container"
        );

        const container = home.template as ContainerElement;
        assert(container.content, "Container should have content");
        assert.equal(
          container.content.length,
          3,
          "Container should have 3 child elements"
        );

        // Test text elements
        const firstText = container.content[0] as TextElement;
        assert.equal(firstText.type, "text", "First element should be text");

        // Test media element
        const mediaContainer = container.content[2] as ContainerElement;
        const mediaElement = mediaContainer.content?.[0] as MediaElement;
        assert.equal(mediaElement.type, "media", "Should have media element");
        assert.equal(
          mediaElement.media?.type,
          "image",
          "Media should be image type"
        );
      }
    );
  });

  test("About Page with Fragments and Vector", async () => {
    await withTestInfrastructure(
      complexInfrastructureData,
      async (infrastructure) => {
        const project = infrastructure.project("complex");
        const router = await getRouterModel(project);

        // Test about route
        const aboutRoute = router.routes[1];
        assert.equal(
          aboutRoute.path,
          "/about",
          "About route should have correct path"
        );

        const aboutComponentAdaptor = aboutRoute.mainViewComponent;
        await aboutComponentAdaptor?.untilRetrieved();
        const about = aboutComponentAdaptor?.model as Component;

        assert.equal(
          about.name,
          "AboutPage",
          "About component should have correct name"
        );
        assert(about.fragments, "About component should have fragments");
        assert.equal(about.fragments.length, 1, "Should have 1 fragment");
        assert.equal(
          about.fragments[0].name,
          "AboutContent",
          "Fragment should be named correctly"
        );

        // Test vector element
        const container = about.template as ContainerElement;
        const vectorElement = container.content?.[1] as VectorElement;
        assert.equal(
          vectorElement.type,
          "vector",
          "Should have vector element"
        );
        assert(vectorElement.content, "Vector should have content");
      }
    );
  });

  test("Dashboard with Dynamic Route Parameters", async () => {
    await withTestInfrastructure(
      complexInfrastructureData,
      async (infrastructure) => {
        const project = infrastructure.project("complex");
        const router = await getRouterModel(project);

        // Test dashboard route with parameter
        const dashboardRoute = router.routes[3];
        assert.equal(
          dashboardRoute.path,
          "/dashboard/:userId",
          "Dashboard route should have parameter"
        );

        const dashboardComponentAdaptor = dashboardRoute.mainViewComponent;
        await dashboardComponentAdaptor?.untilRetrieved();
        const dashboard = dashboardComponentAdaptor?.model as Component;

        assert.equal(
          dashboard.name,
          "DashboardPage",
          "Dashboard component should have correct name"
        );
        assert(dashboard.props, "Dashboard should have props");
        assert.equal(
          dashboard.props[0].name,
          "userId",
          "Should have userId prop"
        );
        assert.equal(
          dashboard.props[0].required,
          true,
          "userId should be required"
        );

        // Test hook state
        assert(dashboard.states, "Dashboard should have states");
        const hookState = dashboard.states.find((s) => s.type === "hook");
        assert(hookState, "Should have hook state");
        assert.equal(
          hookState.name,
          "userData",
          "Hook state should be named userData"
        );
      }
    );
  });
});

describe("Styling Infrastructure Tests", () => {
  test("Styled Components with CSS", async () => {
    await withTestInfrastructure(
      stylingInfrastructureData,
      async (infrastructure) => {
        const project = infrastructure.project("styling");
        const router = await getRouterModel(project);

        const homeRoute = router.routes[0];
        const styledPageAdaptor = homeRoute.mainViewComponent;
        await styledPageAdaptor?.untilRetrieved();
        const styledPage = styledPageAdaptor?.model as Component;

        assert.equal(
          styledPage.name,
          "StyledPage",
          "Component should be StyledPage"
        );

        // Test basic structure
        const container = styledPage.template as ContainerElement;
        assert(container.content, "Container should have content");
        assert.equal(
          container.content.length,
          2,
          "Container should have 2 child elements"
        );

        // Test nested styled elements
        const firstText = container.content?.[0] as TextElement;
        assert.equal(firstText.type, "text", "First element should be text");
        assert.equal(
          firstText.text,
          "Welcome to Styled Page",
          "Text should have correct content"
        );
      }
    );
  });
});

describe("Media Infrastructure Tests", () => {
  test("Media Gallery with Images and Videos", async () => {
    await withTestInfrastructure(
      mediaInfrastructureData,
      async (infrastructure) => {
        const project = infrastructure.project("media");
        const router = await getRouterModel(project);

        const homeRoute = router.routes[0];
        const galleryAdaptor = homeRoute.mainViewComponent;
        await galleryAdaptor?.untilRetrieved();
        const gallery = galleryAdaptor?.model as Component;

        assert.equal(
          gallery.name,
          "MediaGallery",
          "Component should be MediaGallery"
        );

        // Test props
        assert(gallery.props, "Gallery should have props");
        const imagesProps = gallery.props.find((p) => p.name === "images");
        assert(imagesProps, "Should have images prop");
        assert.equal(
          imagesProps.tsType,
          "string[]",
          "Images prop should be string array"
        );

        // Test states
        assert(gallery.states, "Gallery should have states");
        const selectedIndexState = gallery.states.find(
          (s) => s.name === "selectedImageIndex"
        );
        assert(selectedIndexState, "Should have selectedImageIndex state");
        assert.equal(selectedIndexState.type, "value", "Should be value state");

        // Test media elements
        const container = gallery.template as ContainerElement;
        const imageContainer = container.content?.[1] as ContainerElement;
        const imageElement = imageContainer.content?.[0] as MediaElement;

        assert.equal(imageElement.type, "media", "Should have media element");
        assert.equal(
          imageElement.media?.type,
          "image",
          "Media should be image"
        );
        assert.equal(imageElement.fit, "cover", "Image should have cover fit");
        assert(imageElement.position, "Image should have position");

        // Test video element
        const videoContainer = container.content?.[2] as ContainerElement;
        const videoElement = videoContainer.content?.[0] as MediaElement;

        assert.equal(
          videoElement.media?.type,
          "video",
          "Should have video element"
        );
        assert.equal(
          videoElement.fit,
          "contain",
          "Video should have contain fit"
        );

        // Test video-specific properties
        if (videoElement.media?.type === "video") {
          assert(videoElement.media.controls, "Video should have controls");
          assert(videoElement.media.poster, "Video should have poster");
        }
      }
    );
  });
});

describe("State Management Infrastructure Tests", () => {
  test("Value States with Primitives and Objects", async () => {
    await withTestInfrastructure(
      statesInfrastructureData,
      async (infrastructure) => {
        const project = infrastructure.project("states");
        const router = await getRouterModel(project);

        const homeRoute = router.routes[0];
        const stateExamplesAdaptor = homeRoute.mainViewComponent;
        await stateExamplesAdaptor?.untilRetrieved();
        const stateExamples = stateExamplesAdaptor?.model as Component;

        assert.equal(
          stateExamples.name,
          "StateExamples",
          "Component should be StateExamples"
        );
        assert(stateExamples.states, "Component should have states");
        assert.equal(stateExamples.states.length, 8, "Should have 8 states");

        // Test value states
        const counterState = stateExamples.states.find(
          (s) => s.name === "counter"
        );
        assert(counterState, "Should have counter state");
        assert.equal(
          counterState.type,
          "value",
          "Counter should be value state"
        );

        const userState = stateExamples.states.find((s) => s.name === "user");
        assert(userState, "Should have user state");
        assert.equal(userState.type, "value", "User should be value state");

        const todosState = stateExamples.states.find((s) => s.name === "todos");
        assert(todosState, "Should have todos state");
        assert.equal(todosState.type, "value", "Todos should be value state");
      }
    );
  });

  test("Hook States for Data Fetching", async () => {
    await withTestInfrastructure(
      statesInfrastructureData,
      async (infrastructure) => {
        const project = infrastructure.project("states");
        const router = await getRouterModel(project);

        const homeRoute = router.routes[0];
        const stateExamplesAdaptor = homeRoute.mainViewComponent;
        await stateExamplesAdaptor?.untilRetrieved();
        const stateExamples = stateExamplesAdaptor?.model as Component;

        // Test hook states
        const apiDataState = stateExamples.states?.find(
          (s) => s.name === "apiData"
        );
        assert(apiDataState, "Should have apiData state");
        assert.equal(apiDataState.type, "hook", "ApiData should be hook state");

        const filteredTodosState = stateExamples.states?.find(
          (s) => s.name === "filteredTodos"
        );
        assert(filteredTodosState, "Should have filteredTodos state");
        assert.equal(
          filteredTodosState.type,
          "hook",
          "FilteredTodos should be hook state"
        );
      }
    );
  });

  test("Inline States for Computed Values", async () => {
    await withTestInfrastructure(
      statesInfrastructureData,
      async (infrastructure) => {
        const project = infrastructure.project("states");
        const router = await getRouterModel(project);

        const homeRoute = router.routes[0];
        const stateExamplesAdaptor = homeRoute.mainViewComponent;
        await stateExamplesAdaptor?.untilRetrieved();
        const stateExamples = stateExamplesAdaptor?.model as Component;

        // Test inline states
        const completedCountState = stateExamples.states?.find(
          (s) => s.name === "completedCount"
        );
        assert(completedCountState, "Should have completedCount state");
        assert.equal(
          completedCountState.type,
          "inline",
          "CompletedCount should be inline state"
        );

        const userDisplayNameState = stateExamples.states?.find(
          (s) => s.name === "userDisplayName"
        );
        assert(userDisplayNameState, "Should have userDisplayName state");
        assert.equal(
          userDisplayNameState.type,
          "inline",
          "UserDisplayName should be inline state"
        );
      }
    );
  });
});

describe("Mixed Infrastructure Tests", () => {
  test("Multiple Projects in Single Infrastructure", async () => {
    await withTestInfrastructure(
      mixedInfrastructureData,
      async (infrastructure) => {
        // Test all projects exist
        const complexProject = infrastructure.project("complex");
        const stylingProject = infrastructure.project("styling");
        const mediaProject = infrastructure.project("media");
        const statesProject = infrastructure.project("states");

        assert(complexProject, "Complex project should exist");
        assert(stylingProject, "Styling project should exist");
        assert(mediaProject, "Media project should exist");
        assert(statesProject, "States project should exist");

        // Test each project can load independently
        await complexProject.app.untilRetrieved();
        await stylingProject.app.untilRetrieved();
        await mediaProject.app.untilRetrieved();
        await statesProject.app.untilRetrieved();

        const complexApp = complexProject.app.model;
        const stylingApp = stylingProject.app.model;
        const mediaApp = mediaProject.app.model;
        const statesApp = statesProject.app.model;

        assert(complexApp, "Complex app should load");
        assert(stylingApp, "Styling app should load");
        assert(mediaApp, "Media app should load");
        assert(statesApp, "States app should load");
      }
    );
  });

  test("Cross-Project File Access", async () => {
    await withTestInfrastructure(
      mixedInfrastructureData,
      async (infrastructure) => {
        const complexProject = infrastructure.project("complex");
        const stylingProject = infrastructure.project("styling");

        // Test file access within projects
        const complexHomeFile = complexProject.fileAtPath("home");
        const stylingStyledPageFile = stylingProject.fileAtPath("styled-page");

        assert(complexHomeFile, "Should find home file in complex project");
        assert(
          stylingStyledPageFile,
          "Should find styled-page file in styling project"
        );

        // Test file content access
        const complexHomeContent = complexProject.content(complexHomeFile.id);
        const stylingStyledPageContent = stylingProject.content(
          stylingStyledPageFile.id
        );

        await complexHomeContent.untilRetrieved();
        await stylingStyledPageContent.untilRetrieved();

        assert(
          complexHomeContent.text,
          "Complex home content should have text"
        );
        assert(
          stylingStyledPageContent.text,
          "Styling styled-page content should have text"
        );

        // Verify content contains expected data
        assert(
          complexHomeContent.text.includes("HomePage"),
          "Home content should contain HomePage"
        );
        assert(
          stylingStyledPageContent.text.includes("StyledPage"),
          "Styled-page content should contain StyledPage"
        );
      }
    );
  });
});

// Helper function to get router model
async function getRouterModel(project: any) {
  await project.app.untilRetrieved();
  const app = project.app.model;
  const routerAdaptor = app.router;
  await routerAdaptor.untilRetrieved();
  return routerAdaptor.model;
}
