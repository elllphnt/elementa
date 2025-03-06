import { useObservable } from "@repo/utils";
import { Handle } from "../../handles/handle";
import { EdgeComponent } from "./edge";

export function HandleConnectionSet({ handle }: { handle: Handle }) {
  const connections = useObservable(handle.connections$, handle.connections);

  return (
    <>
      {connections.map((connection) => (
        <EdgeComponent key={connection.key} edge={connection} />
      ))}
    </>
  );
}
