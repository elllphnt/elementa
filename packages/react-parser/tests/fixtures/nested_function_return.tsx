function Component() {
  function double(x) {
    return x * 2;
  }

  const value = double(5);

  return (
    <div>
      <h2>Component with nested function</h2>
      <p>Double of 5 is {value}</p>
    </div>
  );
}

export default Component;
