import { useMemo, useReducer } from "react";

function Component() {
  // Reducer function
  const reducer = (state, action) => {
    switch (action.type) {
      case "UPDATE_NAME":
        return { ...state, name: action.payload };
      case "UPDATE_AGE":
        return { ...state, age: action.payload };
      default:
        return state;
    }
  };

  // Hook with object argument
  const [user, dispatch] = useReducer(reducer, { name: "John", age: 30 });

  // Hook with array argument
  const items = useMemo(() => ["item1", "item2"], []);

  return (
    <div>
      <p>
        User: {user.name}, Age: {user.age}
      </p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default Component;
