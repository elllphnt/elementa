function NestedFragmentComponent(props) {
  __defineFragment("qmku3nfda9", ({ count }: { count: number }) => (
    <>
      <h2>Nested Fragment {count}</h2>
      <p
        onClick={(count) => {
          console.log("Clicked on nested fragment with count:", count);
        }}
      >
        This is in a nested fragment
      </p>
    </>
  ));

  const state_1 = 90;

  return (
    <>
      <h1>Main Title</h1>
      <div>{__fragment("qmku3nfda9", { count: state_1 })}</div>
      <footer>
        <>Footer content</>
      </footer>
    </>
  );
}

export default NestedFragmentComponent;
