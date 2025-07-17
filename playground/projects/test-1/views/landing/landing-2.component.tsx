import React from 'react';

export default function Landing() {
  return (
    <main 
      css={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: 'linear-gradient(135deg, #f0e6d2, #d9cbb6)',
        color: '#4b3b2b',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 
        css={{
          fontSize: '3.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          transition: 'color 0.3s ease-in-out',
          '&:hover': {
            color: '#c05c32',
            cursor: 'pointer',
          },
        }}
        tabIndex={0}
        aria-label="Welcome to our restaurant"
      >
        Welcome to Savory Delights
      </h1>
      <p 
        css={{
          fontSize: '1.25rem',
          maxWidth: '28rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
          color: '#6e5a3c'
        }}
      >
        Experience exquisite flavors and cozy ambiance. Join us for a memorable dining experience with fresh ingredients and creative dishes.
      </p>
      <button 
        css={{
          backgroundColor: '#c05c32',
          border: 'none',
          padding: '0.8rem 2rem',
          fontSize: '1.25rem',
          color: 'white',
          borderRadius: '30px',
          boxShadow: '0 4px 15px rgba(192, 92, 50, 0.5)',
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
          '&:hover, &:focus': {
            backgroundColor: '#d97845',
            boxShadow: '0 6px 20px rgba(217, 120, 69, 0.7)',
            cursor: 'pointer',
            outline: 'none'
          },
          '&:active': {
            boxShadow: 'none',
            backgroundColor: '#a14b26'
          }
        }}
        aria-label="Make a reservation"
        onClick={() => alert('Reservation feature coming soon!')}
      >
        Make a Reservation
      </button>
      <footer 
        css={{
          marginTop: '4rem',
          fontSize: '0.875rem',
          color: '#8b7a66'
        }}
      >
        &copy; 2024 Savory Delights Restaurant
      </footer>
    </main>
  );
}
