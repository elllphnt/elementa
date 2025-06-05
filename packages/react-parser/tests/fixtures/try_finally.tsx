import React from "react";

function TryFinallyComponent() {
  let localVar = "initialValue";

  try {
    localVar = "modifiedValue";
  } finally {
    console.log("Cleanup in finally block");
  }

  // State after try-finally should be extracted
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Counter: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Local variable: {localVar}</p>
    </div>
  );
}

export default TryFinallyComponent;
