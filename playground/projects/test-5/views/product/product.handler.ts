import type { Request, Response } from "express";

// Simulated product database
const mockProducts = [
  {
    id: "1",
    name: "Modern Wireless Headphones",
    description:
      "High-quality wireless headphones with noise cancellation and long battery life.",
    price: 199.99,
    images: [
      "/images/headphones1.jpg",
      "/images/headphones2.jpg",
      "/images/headphones3.jpg",
    ],
    variants: {
      color: ["black", "white", "silver"],
      size: null,
    },
    inStock: 15,
  },
  {
    id: "2",
    name: "Smart Fitness Tracker",
    description:
      "Advanced fitness tracker with heart rate monitoring and GPS tracking.",
    price: 129.99,
    images: ["/images/tracker1.jpg", "/images/tracker2.jpg"],
    variants: {
      color: ["blue", "green", "red"],
      size: ["S", "M", "L"],
    },
    inStock: 25,
  },
];

export const getProduct = (req: Request, res: Response) => {
  const { productId } = req.params;

  const product = mockProducts.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

export const listProducts = (req: Request, res: Response) => {
  // Optional query parameters for filtering/pagination
  const { category, page = 1, limit = 10 } = req.query;

  const filteredProducts = mockProducts;

  // Add optional filtering logic here if needed

  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = Number(page) * Number(limit);

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    total: filteredProducts.length,
    page: Number(page),
    totalPages: Math.ceil(filteredProducts.length / Number(limit)),
  });
};

export default { getProduct, listProducts };
