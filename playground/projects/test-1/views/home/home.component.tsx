import React from 'react';

export default function Component() {
  return (
    <main
      css={{
        padding: '2rem',
        maxWidth: '900px',
        margin: '2rem auto',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
      }}
    >
      <h1
        css={{
          fontSize: '2.5rem',
          color: '#1a73e8',
          marginBottom: '1rem',
          fontWeight: '700',
          textAlign: 'center',
          textShadow: '0 1px 3px rgba(26, 115, 232, 0.3)',
        }}
      >
        Welcome to Learnify Online Courses
      </h1>
      <section
        css={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <h2 css={{ fontSize: '1.5rem', color: '#0d47a1', marginBottom: '1rem' }}>
          Featured Courses
        </h2>
        <p css={{ fontSize: '1rem', color: '#555' }}>
          Explore our top courses curated by experts to boost your skills.
        </p>
        {/* Placeholder for featured courses list or carousel */}
      </section>
    </main>
  );
}
