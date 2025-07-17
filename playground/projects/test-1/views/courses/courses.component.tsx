import React from 'react';

export default function Component() {
  return (
    <main
      css={{
        padding: '2rem',
        maxWidth: '900px',
        margin: '2rem auto',
        fontFamily: 'Arial, sans-serif',
        color: '#222',
      }}
    >
      <h1
        css={{
          fontSize: '2rem',
          marginBottom: '1.5rem',
          color: '#1565c0',
          fontWeight: '700',
        }}
      >
        All Courses
      </h1>
      <section
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Placeholder for course cards */}
        <div
          css={{
            padding: '1rem',
            backgroundColor: '#e8f0fe',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(21, 101, 192, 0.3)',
            textAlign: 'center',
            color: '#0d47a1',
            fontWeight: '600',
            fontSize: '1.1rem',
            userSelect: 'none',
          }}
        >
          Course cards will be shown here.
        </div>
      </section>
    </main>
  );
}
