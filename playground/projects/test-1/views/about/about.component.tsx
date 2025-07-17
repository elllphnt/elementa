import React from 'react';

export default function Component() {
  return (
    <main
      css={{
        maxWidth: '700px',
        margin: '3rem auto',
        padding: '1rem',
        fontFamily: 'Arial, sans-serif',
        color: '#283593',
        lineHeight: '1.6',
      }}
    >
      <h1
        css={{
          fontSize: '2.2rem',
          fontWeight: '700',
          marginBottom: '1rem',
          userSelect: 'none',
          textAlign: 'center',
        }}
      >
        About Learnify
      </h1>
      <section
        css={{
          backgroundColor: '#e8eaf6',
          borderRadius: '8px',
          padding: '1.5rem 2rem',
          boxShadow: '0 2px 12px rgba(33, 33, 33, 0.1)',
          fontSize: '1.1rem',
          color: '#3949ab',
        }}
      >
        <p>
          Learnify is an innovative online course platform designed to empower
          learners worldwide. We offer expertly curated courses taught by industry
          professionals, focusing on practical skills and real-world applications.
        </p>
        <p>
          Our mission is to provide accessible, engaging, and high-quality
          education that fits your schedule and helps you advance your career or
          personal growth.
        </p>
        <p>
          Whether you are starting a new career, enhancing your skills, or pursuing
          a passion, Learnify is here to support your learning journey every step
          of the way.
        </p>
      </section>
    </main>
  );
}
