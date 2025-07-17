import type { LoaderFunction } from "react-router-dom";

export const loader: LoaderFunction = async () => {
  try {
    // Simulated API call - replace with actual API endpoint
    const response = await fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();
    return {
      products: data.products || [],
      total: data.total || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error loading products:", error);
    return {
      products: [],
      total: 0,
      page: 1,
      totalPages: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default loader;
