import { useEffect, useState } from "react";

export default function MixedFragmentsHooks() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1);
  }, []);

  const fragment = (
    <>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </>
  );

  return fragment;
}
