interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

export default function Component() {
  const products = [
    {
      id: "1",
      name: "Product One",
      price: 29.99,
      images: ["/images/product1.jpg"],
    },
    {
      id: "2",
      name: "Product Two",
      price: 49.99,
      images: ["/images/product2.jpg"],
    },
    {
      id: "3",
      name: "Product Three",
      price: 19.99,
      images: ["/images/product3.jpg"],
    },
  ];

  return (
    <div
      css={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <h1
        css={{
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "2.5rem",
          color: "#333",
        }}
      >
        Our Products
      </h1>

      <div
        css={{
          "display": "grid",
          "gridTemplateColumns": "repeat(auto-fill, minmax(250px, 1fr))",
          "gap": "2rem",
          "@media (max-width: 768px)": {
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          },
        }}
      >
        {products.map((product) => (
          <a
            href={`/products/${product.id}`}
            key={product.id}
            css={{
              "textDecoration": "none",
              "color": "inherit",
              "transition": "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <div
              css={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                backgroundColor: "white",
              }}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                css={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                }}
              />
              <div
                css={{
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <h3
                  css={{
                    fontSize: "1.2rem",
                    marginBottom: "0.5rem",
                    color: "#333",
                  }}
                >
                  {product.name}
                </h3>
                <p
                  css={{
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "#007bff",
                  }}
                >
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export const css = `
  @keyframes productHover {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
`;
