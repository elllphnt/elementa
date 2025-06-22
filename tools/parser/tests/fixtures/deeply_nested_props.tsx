function DeepComponent({
  user: {
    profile: {
      details: {
        name,
        address: { city },
      },
    },
  },
}) {
  return (
    <div>
      <p>
        Name: {name}, City: {city}
      </p>
    </div>
  );
}

export default DeepComponent;
