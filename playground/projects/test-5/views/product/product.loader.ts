import type { LoaderFunction } from "react-router-dom";

export const loader: LoaderFunction = async ({ params }) => {
  const productId = params.productId as string;

  try {
    // Simulated API call - replace with actual API endpoint
    const response = await fetch(`/api/products/${productId}`);

    if (!response.ok) {
      throw new Error("Product not found");
    }

    const product = await response.json();
    return { product };
  } catch (error) {
    console.error("Failed to load product:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      product: null,
    };
  }
};

export default loader;
