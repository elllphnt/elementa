import { useEffect, useRef, useState } from "react";

function Component() {
  const [count, setCount] = useState(0);
  const buttonRef = useRef(null);

  useEffect(() => {
    setCount(count + 1);
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button ref={buttonRef} onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Component;
