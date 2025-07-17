import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Running Shoes',
    price: 79.99,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    description: 'Comfortable and lightweight running shoes for daily workouts and runs.',
  },
  {
    id: '2',
    name: 'Wireless Headphones',
    price: 149.99,
    imageUrl: 'https://images.unsplash.com/photo-1512499617640-c2f9990179f8?auto=format&fit=crop&w=400&q=80',
    description: 'High-quality wireless headphones with noise cancellation and long battery life.',
  },
  {
    id: '3',
    name: 'Smartwatch',
    price: 199.99,
    imageUrl: 'https://images.unsplash.com/photo-1519741493171-9897f44c7c8a?auto=format&fit=crop&w=400&q=80',
    description: 'Stylish smartwatch with health tracking and customizable watch faces.',
  },
  {
    id: '4',
    name: 'Backpack',
    price: 59.99,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80',
    description: 'Durable and spacious backpack suitable for travel, school, or work.',
  },
];

export default function Component() {
  return (
    <div
      css={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {products.map((product) => (
        <div
          key={product.id}
          css={{
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              cursor: 'pointer',
            },
          }}
          aria-label={`View details for ${product.name}`}
          tabIndex={0}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            css={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
          <div css={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h2
              css={{
                fontSize: '1.25rem',
                margin: '0 0 0.5rem 0',
                fontWeight: '600',
                color: '#222',
                flexGrow: 1,
              }}
            >
              {product.name}
            </h2>
            <p
              css={{
                fontSize: '1rem',
                color: '#666',
                flexGrow: 1,
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {product.description}
            </p>
            <div
              css={{
                fontWeight: '700',
                fontSize: '1.15rem',
                color: '#e60023',
              }}
              aria-label={`Price: $${product.price.toFixed(2)}`}
            >
              ${product.price.toFixed(2)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
