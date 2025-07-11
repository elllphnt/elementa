import { useState } from "react";
import type { KO as Image } from "../image";

type User = {
  name: string;
  picture: Image;
};

function StateComponent(props: { hey: string; useUser: () => User }) {
  const { name, picture } = useUser("color");
  const [state, setState] = useState("initial");
  const updateState = () => {
    setState("updated");
  };
  return (
    <div>
      <div>name: {name}</div>
      <div>state: {state}</div>
      {
        <>
          <button onClick={updateState}>Update State</button>
        </>
      }
      <button onClick={updateState}>Update State</button>
      <img src={picture} alt="User Picture" />
    </div>
  );
}

export const css = `
.div {
  color: red;
}
.button {
  background-color: blue;
  color: white;
}
`;

export default StateComponent;
