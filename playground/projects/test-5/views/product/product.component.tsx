import { useState } from "react";

export interface ProductProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    variants?: {
      color?: string[];
      size?: string[];
    };
    inStock: number;
  };
}

export default function Component({ product }: ProductProps) {
  const [selectedVariant, setSelectedVariant] = useState({
    color: product.variants?.color?.[0] || "",
    size: product.variants?.size?.[0] || "",
  });
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const handleAddToCart = () => {
    // Placeholder for add to cart functionality
    console.log("Added to cart:", {
      productId: product.id,
      quantity,
      variant: selectedVariant,
    });
  };

  return (
    <div
      css={{
        display: "flex",
        maxWidth: "1200px",
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Image Gallery */}
      <div
        css={{
          flex: "1",
          display: "flex",
          gap: "1rem",
        }}
      >
        {/* Thumbnail Strip */}
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {product.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Product thumbnail ${index + 1}`}
              css={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                cursor: "pointer",
                opacity: activeImage === index ? 1 : 0.6,
                border: activeImage === index ? "2px solid #007bff" : "none",
              }}
              onClick={() => setActiveImage(index)}
            />
          ))}
        </div>

        {/* Main Image */}
        <div
          css={{
            flex: "1",
          }}
        >
          <img
            src={product.images[activeImage]}
            alt={product.name}
            css={{
              width: "100%",
              height: "500px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </div>
      </div>

      {/* Product Details */}
      <div
        css={{
          flex: "1",
          paddingLeft: "2rem",
        }}
      >
        <h1
          css={{
            fontSize: "2rem",
            marginBottom: "1rem",
            color: "#333",
          }}
        >
          {product.name}
        </h1>

        <p
          css={{
            color: "#666",
            marginBottom: "1.5rem",
          }}
        >
          {product.description}
        </p>

        <div
          css={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <span
            css={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#007bff",
            }}
          >
            ${product.price.toFixed(2)}
          </span>
          <span
            css={{
              marginLeft: "1rem",
              color: product.inStock > 0 ? "#28a745" : "#dc3545",
            }}
          >
            {product.inStock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Color Variants */}
        {product.variants?.color && (
          <div css={{ marginBottom: "1rem" }}>
            <label css={{ display: "block", marginBottom: "0.5rem" }}>
              Color
            </label>
            <div css={{ display: "flex", gap: "0.5rem" }}>
              {product.variants.color.map((color) => (
                <button
                  key={color}
                  css={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    border:
                      selectedVariant.color === color
                        ? "3px solid #007bff"
                        : "1px solid #ddd",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setSelectedVariant((prev) => ({ ...prev, color }))
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Size Variants */}
        {product.variants?.size && (
          <div css={{ marginBottom: "1rem" }}>
            <label css={{ display: "block", marginBottom: "0.5rem" }}>
              Size
            </label>
            <div css={{ display: "flex", gap: "0.5rem" }}>
              {product.variants.size.map((size) => (
                <button
                  key={size}
                  css={{
                    padding: "0.5rem 1rem",
                    border:
                      selectedVariant.size === size
                        ? "2px solid #007bff"
                        : "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setSelectedVariant((prev) => ({ ...prev, size }))
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div
          css={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <label css={{ marginRight: "1rem" }}>Quantity</label>
          <div
            css={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <button
              css={{
                padding: "0.5rem 1rem",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
              }}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <span css={{ padding: "0 1rem" }}>{quantity}</span>
            <button
              css={{
                padding: "0.5rem 1rem",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
              }}
              onClick={() =>
                setQuantity(Math.min(product.inStock, quantity + 1))
              }
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          css={{
            "width": "100%",
            "padding": "1rem",
            "backgroundColor": "#007bff",
            "color": "white",
            "border": "none",
            "borderRadius": "4px",
            "fontSize": "1rem",
            "cursor": "pointer",
            "transition": "background-color 0.3s ease",
            "&:hover": {
              backgroundColor: "#0056b3",
            },
            "&:disabled": {
              backgroundColor: "#cccccc",
              cursor: "not-allowed",
            },
          }}
          disabled={product.inStock === 0}
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export const css = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
