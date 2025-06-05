function Component() {
  // This function doesn't start with "use" and shouldn't be treated as a hook
  function getNumber() {
    return 42;
  }

  const result = getNumber();

  return (
    <div>
      <p>Result: {result}</p>
    </div>
  );
}

export default Component;
