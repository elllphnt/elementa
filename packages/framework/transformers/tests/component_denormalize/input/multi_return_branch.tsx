function FragmentComponent(props) {
  __defineFragment("f5duwwgdi9", ({ title }: { title: string }) => (
    <>
      <h1>{title}</h1>
      <div>Content</div>
    </>
  ));
  __defineFragment("h9k4tf69pi", ({ title }: { title: string }) => (
    <>
      <h1>{title}</h1>
      <div>Content</div>
    </>
  ));
  const state_1 = (() => {
    const title: string = "Title";
    const [active, setTitle] = useState<boolean>(true);
    if (active) {
      return __fragment("h9k4tf69pi", { title });
    } else {
      return __fragment("f5duwwgdi9", { title });
    }
  })();
  return state_1;
}

export default FragmentComponent;
