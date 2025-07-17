import React from 'react';

export default function ProductList() {
  const products = [
    { id: 1, name: 'Wireless Headphones', price: '$99', imageUrl: '/images/headphones.jpg' },
    { id: 2, name: 'Smart Watch', price: '$199', imageUrl: '/images/smartwatch.jpg' },
    { id: 3, name: 'Gaming Keyboard', price: '$89', imageUrl: '/images/keyboard.jpg' },
    { id: 4, name: '4K Monitor', price: '$399', imageUrl: '/images/monitor.jpg' },
  ];

  return (
    <main
      css={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
      }}
    >
      <h1
        css={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '2rem',
          color: '#222',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        Our Products
      </h1>
      <section
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {products.map(product => (
          <article
            key={product.id}
            css={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                transform: 'translateY(-5px)',
              },
            }}
          >
            <div
              css={{
                height: '200px',
                backgroundImage: `url(${product.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              role="img"
              aria-label={`Image of ${product.name}`}
            />
            <div
              css={{
                padding: '1rem',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <h2
                css={{
                  fontSize: '1.25rem',
                  color: '#333',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                }}
              >
                {product.name}
              </h2>
              <p
                css={{
                  fontSize: '1rem',
                  color: '#777',
                  fontWeight: '700',
                }}
              >
                {product.price}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
