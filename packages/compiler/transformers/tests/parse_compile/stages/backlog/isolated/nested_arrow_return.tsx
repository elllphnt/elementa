import { useState } from "react";

function Component() {
  const [count, setCount] = useState(0);

  const doubledItems = [1, 2, 3].map((item) => {
    return item * 2;
  });

  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ul>
        {doubledItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default Component;
