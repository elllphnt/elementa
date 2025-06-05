const BaseComponent = (props) => {
  return <div>{props.message}</div>;
};

// Custom HOC that's not recognized
const withCustom = (Component) => {
  return (props) => <Component {...props} />;
};

export default withCustom(BaseComponent);
