function RestComponent({ name, ...rest }) {
  return (
    <div>
      <p>Name: {name}</p>
      <button {...rest}>Click me</button>
    </div>
  );
}

export default RestComponent;
