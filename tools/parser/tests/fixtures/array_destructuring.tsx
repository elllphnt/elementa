export default function ArrayDestructuring() {
  const [first, second, third] = ["one", "two", "three"];

  if (first === "one") {
    return <div>{first}</div>;
  }

  return (
    <div>
      <h1>{first}</h1>
      <h2>{second}</h2>
      <h3>{third}</h3>
    </div>
  );
}
