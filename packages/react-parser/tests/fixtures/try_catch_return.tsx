import React from "react";

function TryCatchReturnComponent({ shouldError }) {
  const [count, setCount] = React.useState(0);

  try {
    if (shouldError) {
      throw new Error("Test error");
    }
  } catch (error) {
    return <div>An error occurred!</div>;
  }

  // This code should only run if no error occurred
  return (
    <div>
      <p>No error occurred</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default TryCatchReturnComponent;
