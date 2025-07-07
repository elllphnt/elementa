// This component defines an enum with initializers that contain return statements
export default function Component() {
  // Enum with initializers containing return expressions
  enum Direction {
    UP = (() => {
      return 0;
    })(),
    DOWN = (() => {
      return 1;
    })(),
    LEFT = (() => {
      return 2;
    })(),
    RIGHT = (() => {
      return 3;
    })(),
  }

  // Use the enum in the component
  const currentDirection = Direction.UP;
  const directionName = Direction[currentDirection];

  return (
    <div>
      <h2>Enum Component</h2>
      <p>Direction: {directionName}</p>
    </div>
  );
}
