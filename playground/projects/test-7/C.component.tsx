export default function C() {
  return (
    <div>
      This is Page C.
      <br />
      <navlink to="/b">
        <span>Go to Page B</span>
      </navlink>
      <br />
      <navlink to="/a">
        <span>Go to Page A</span>
      </navlink>
    </div>
  );
}
