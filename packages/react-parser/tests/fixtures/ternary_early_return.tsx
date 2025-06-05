function LoadingComponent({ isLoading }) {
  // Early return using ternary
  return isLoading ? <div>Loading...</div> : null;
}

export default LoadingComponent;
