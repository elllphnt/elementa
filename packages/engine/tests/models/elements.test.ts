import type {
  ContainerElement,
  ExpressionElement,
  FragmentElement,
  MediaElement,
  TextElement,
  VectorElement,
} from "@elllphnt/elementa-models";
import { afterAll, afterEach, assert, beforeAll, describe, test } from "vitest";
import { TestInfrastructure } from "~/infrastructure.js";
import { complexInfrastructureData } from "../infrastructures/complex/infrastructure.js";
import { mediaInfrastructureData } from "../infrastructures/media/infrastructure.js";
import {
  setupLifecycleTracking,
  teardownLifecycleTracking,
  validateLifecycleCleanup,
  withTestInfrastructure,
} from "../lifecycle-tracking.js";

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

// Helper function to get router model
async function getRouterModel(project: any) {
  await project.app.untilRetrieved();
  const app = project.app.model;
  assert(app, "App should be loaded");

  const routerAdaptor = app.router;
  assert(routerAdaptor, "Router adaptor should exist");

  await routerAdaptor.untilRetrieved();
  const router = routerAdaptor.model;
  assert(router, "Router should be loaded");

  return router;
}

describe("Element Types Tests", () => {
  test("Text Elements with Static and Dynamic Content", async () => {
    await withTestInfrastructure(
      complexInfrastructureData,
      async (infrastructure) => {
        const project = infrastructure.project("complex");
        const router = await getRouterModel(project);

        const homeRoute = router.routes[0];
        const homeComponentAdaptor = homeRoute.mainViewComponent;
        await homeComponentAdaptor?.untilRetrieved();
        const home = homeComponentAdaptor?.model;

        const container = home?.template as ContainerElement;
        const textElements = container.content?.filter(
          (el) => el.type === "text"
        ) as TextElement[];

        assert(textElements, "Should have text elements");
        assert(
          textElements.length >= 2,
          "Should have at least 2 text elements"
        );

        // Test first text element (should have dynamic content)
        const firstText = textElements[0];
        assert.equal(firstText.type, "text", "Should be text element");
        assert(firstText.text, "Text element should have text content");
      }
    );
  });

  test("Container Elements with Nested Content", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    const homeRoute = router.routes[0];
    const homeComponentAdaptor = homeRoute.mainViewComponent;
    await homeComponentAdaptor?.untilRetrieved();
    const home = homeComponentAdaptor?.model;

    const rootContainer = home?.template as ContainerElement;
    assert.equal(
      rootContainer.type,
      "container",
      "Root template should be container"
    );
    assert(rootContainer.content, "Container should have content");

    // Find nested container
    const nestedContainer = rootContainer.content?.find(
      (el) =>
        el.type === "container" && (el as ContainerElement).content?.length
    ) as ContainerElement;

    assert(nestedContainer, "Should have nested container");
    assert(nestedContainer.content, "Nested container should have content");
    assert(
      nestedContainer.content.length > 0,
      "Nested container should have child elements"
    );
  });

  test("Media Elements with Image and Video", async () => {
    const infrastructure = new TestInfrastructure({
      data: mediaInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("media");
    const router = await getRouterModel(project);

    const homeRoute = router.routes[0];
    const galleryAdaptor = homeRoute.mainViewComponent;
    await galleryAdaptor?.untilRetrieved();
    const gallery = galleryAdaptor?.model;

    const container = gallery?.template as ContainerElement;

    // Find media elements in nested containers
    const findMediaElements = (element: any): MediaElement[] => {
      if (element.type === "media") {
        return [element];
      }
      if (element.type === "container" && element.content) {
        return element.content.flatMap(findMediaElements);
      }
      return [];
    };

    const mediaElements = container.content?.flatMap(findMediaElements) || [];
    assert(mediaElements.length >= 2, "Should have at least 2 media elements");

    // Test image element
    const imageElement = mediaElements.find((el) => el.media?.type === "image");
    assert(imageElement, "Should have image element");
    assert.equal(imageElement.media?.type, "image", "Should be image type");
    assert.equal(imageElement.fit, "cover", "Image should have cover fit");
    assert(imageElement.position, "Image should have position");

    // Test video element
    const videoElement = mediaElements.find((el) => el.media?.type === "video");
    assert(videoElement, "Should have video element");
    assert.equal(videoElement.media?.type, "video", "Should be video type");
    assert.equal(videoElement.fit, "contain", "Video should have contain fit");
  });

  test("Vector Elements with SVG Content", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    const aboutRoute = router.routes[1];
    const aboutComponentAdaptor = aboutRoute.mainViewComponent;
    await aboutComponentAdaptor?.untilRetrieved();
    const about = aboutComponentAdaptor?.model;

    const container = about?.template as ContainerElement;
    const vectorElement = container.content?.find(
      (el) => el.type === "vector"
    ) as VectorElement;

    assert(vectorElement, "Should have vector element");
    assert.equal(vectorElement.type, "vector", "Should be vector type");
    assert(vectorElement.content, "Vector should have content");
    assert(vectorElement.content?.length > 0, "Vector should have child nodes");

    // Test vector content structure
    const circleNode = vectorElement.content?.[0];
    assert(circleNode, "Should have circle node");
    if (circleNode?.type === "element") {
      assert.equal(circleNode.tagName, "circle", "Should be circle element");
      assert(circleNode.properties, "Circle should have properties");
    }
  });

  test("Expression Elements for Dynamic Content", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    const dashboardRoute = router.routes[3];
    const dashboardComponentAdaptor = dashboardRoute.mainViewComponent;
    await dashboardComponentAdaptor?.untilRetrieved();
    const dashboard = dashboardComponentAdaptor?.model;

    const container = dashboard?.template as ContainerElement;
    const expressionElements = container.content?.filter(
      (el) => el.type === "expression"
    ) as ExpressionElement[];

    assert(expressionElements, "Should have expression elements");
    assert(
      expressionElements.length >= 2,
      "Should have at least 2 expression elements"
    );

    // Test expression elements
    for (const expr of expressionElements) {
      assert.equal(expr.type, "expression", "Should be expression type");
      assert(expr.expression, "Expression should have expression string");
    }
  });

  test("Fragment Elements and References", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    const aboutRoute = router.routes[1];
    const aboutComponentAdaptor = aboutRoute.mainViewComponent;
    await aboutComponentAdaptor?.untilRetrieved();
    const about = aboutComponentAdaptor?.model;

    // Test fragments definition
    assert(about?.fragments, "Component should have fragments");
    assert.equal(about.fragments.length, 1, "Should have 1 fragment");

    const fragment = about.fragments[0];
    assert.equal(
      fragment.name,
      "AboutContent",
      "Fragment should be named AboutContent"
    );
    assert(fragment.content, "Fragment should have content");

    // Test fragment element usage
    const container = about.template as ContainerElement;
    const fragmentElement = container.content?.find(
      (el) => el.type === "fragment"
    ) as FragmentElement;

    assert(fragmentElement, "Should have fragment element");
    assert.equal(fragmentElement.type, "fragment", "Should be fragment type");
    assert(
      fragmentElement.fragmentId,
      "Fragment element should have fragmentId"
    );
  });
});

describe("Element Properties and Attributes Tests", () => {
  test("Element IDs and Identifiers", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    const homeRoute = router.routes[0];
    const homeComponentAdaptor = homeRoute.mainViewComponent;
    await homeComponentAdaptor?.untilRetrieved();
    const home = homeComponentAdaptor?.model;

    const container = home?.template as ContainerElement;

    // Test that all elements have IDs
    const checkElementIds = (element: any): void => {
      assert(element.id, `Element of type ${element.type} should have id`);

      if (element.type === "container" && element.content) {
        element.content.forEach(checkElementIds);
      }
    };

    checkElementIds(container);
  });

  test("Element Type Consistency", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    const homeRoute = router.routes[0];
    const homeComponentAdaptor = homeRoute.mainViewComponent;
    await homeComponentAdaptor?.untilRetrieved();
    const home = homeComponentAdaptor?.model;

    const container = home?.template as ContainerElement;

    // Test element type consistency
    const checkElementTypes = (element: any): void => {
      const validTypes = [
        "text",
        "container",
        "media",
        "vector",
        "expression",
        "fragment",
        "slot",
        "component",
        "primitive",
      ];

      assert(
        validTypes.includes(element.type),
        `${element.type} should be a valid element type`
      );

      if (element.type === "container" && element.content) {
        element.content.forEach(checkElementTypes);
      }
    };

    checkElementTypes(container);
  });
});
