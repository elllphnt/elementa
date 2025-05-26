import { updateYMap } from "@elllphnt/crdt";
import { assert, test } from "vitest";
import * as y from "yjs";
import { CrdtAppBlueprint } from "~/index.js";

test("", () => {
  const doc = new y.Doc();
  const map = doc.getMap("blueprint");
  updateYMap(map, {
    nodes: [
      {
        id: "node_1",
        position: {
          x: 10,
          y: 90,
        },
        __crdtAtomic: ["position"],
      },
    ],
  });
  const blueprint = new CrdtAppBlueprint(map);
  const node1 = blueprint.node("node_1");
  assert(node1);
  assert(node1.position);
  assert.equal(node1.position.x, 10);
  assert.equal(node1.position.y, 90);
});
