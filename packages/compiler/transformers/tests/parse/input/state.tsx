import { useState } from "react";

type User = {
  name: string;
  picture: string;
};

function StateComponent(props: { hey: string; useUser: () => User }) {
  const { name, picture } = useUser();
  const [state, setState] = useState("initial");
  const updateState = () => {
    setState("updated");
  };
  return (
    <div>
      <div>name: {name}</div>
      <div>state: {state}</div>
      <button onClick={updateState}>Update State</button>
      <img src={picture} alt="User Picture" />
    </div>
  );
}

export default StateComponent;
