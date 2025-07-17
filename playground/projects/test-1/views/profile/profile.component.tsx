import React from 'react';

export default function Component() {
  return (
    <main
      css={{
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '1rem',
        fontFamily: 'Arial, sans-serif',
        color: '#222',
      }}
    >
      <h1
        css={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: '#1565c0',
          userSelect: 'none',
          textAlign: 'center',
        }}
      >
        User Profile
      </h1>

      <section
        css={{
          backgroundColor: '#f0f4ff',
          borderRadius: '10px',
          padding: '1.5rem',
          boxShadow: '0 4px 10px rgba(21, 101, 192, 0.15)',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        <h2 css={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Welcome back, User!
        </h2>
        <p css={{ color: '#444', fontSize: '1rem' }}>
          Here you can view your learning progress and manage your account.
        </p>
      </section>

      <section
        css={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(21, 101, 192, 0.2)',
        }}
      >
        <h3 css={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
          Your Progress
        </h3>

        {/* Placeholder for progress bars or completed courses list */}
        <div
          css={{
            fontSize: '1rem',
            color: '#666',
            fontStyle: 'italic',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          You have completed 0 courses.
        </div>
      </section>
    </main>
  );
}
