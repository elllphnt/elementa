import { memo } from "react";

const Component = (props) => {
  return <div>{props.message}</div>;
};

const areEqual = (prevProps, nextProps) => {
  return prevProps.message === nextProps.message;
};

export default memo(Component, areEqual, "extraArg");
