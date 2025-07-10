function Component() {
  class Calculator {
    constructor(initialValue) {
      this.value = initialValue;
    }

    double() {
      return this.value * 2;
    }
  }

  const calc = new Calculator(5);
  const result = calc.double();

  return (
    <div>
      <h2>Class Calculator Result: {result}</h2>
    </div>
  );
}

export default Component;
