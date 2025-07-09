function Component() {
  // This function starts with "use" but doesn't follow the React hook naming convention
  function use42() {
    return 42;
  }

  const value = use42();

  return (
    <div>
      <p>Value: {value}</p>
    </div>
  );
}

export default Component;
