function HookComponent(props) {
  const [count, setCount] = useState(0);
  const value = useMemo(() => count * 2, [count]);

  return (
    <div>
      Count: {count}, Value: {value}
    </div>
  );
}

export default HookComponent;
