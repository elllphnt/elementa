import React from 'react';

export default function Component() {
  return (
    <main
      css={{
        display: 'flex',
        maxWidth: '1200px',
        margin: '2rem auto',
        fontFamily: 'Arial, sans-serif',
        color: '#222',
        gap: '2rem',
        padding: '0 1rem',
      }}
    >
      {/* Sidebar for lessons navigation */}
      <nav
        css={{
          flex: '0 0 280px',
          backgroundColor: '#f5faff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
          padding: '1rem 1.5rem',
          height: 'min-content',
          position: 'sticky',
          top: '1rem',
          overflowY: 'auto',
          maxHeight: '80vh',
        }}
      >
        <h2
          css={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#1976d2',
            userSelect: 'none',
          }}
        >
          Lessons
        </h2>
        <ul
          css={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Placeholder lessons - these will be dynamic later */}
          <li
            css={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              userSelect: 'none',
              '&:hover': { backgroundColor: '#bbdefb' },
            }}
          >
            Introduction
          </li>
          <li
            css={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              userSelect: 'none',
              '&:hover': { backgroundColor: '#bbdefb' },
            }}
          >
            Lesson 1: Basics
          </li>
          <li
            css={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              userSelect: 'none',
              '&:hover': { backgroundColor: '#bbdefb' },
            }}
          >
            Lesson 2: Intermediate
          </li>
          <li
            css={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              userSelect: 'none',
              '&:hover': { backgroundColor: '#bbdefb' },
            }}
          >
            Conclusion
          </li>
        </ul>
      </nav>

      {/* Main content area for course overview */}
      <section
        css={{
          flex: '1 1 auto',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          padding: '2rem',
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <h1
          css={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#0d47a1',
            marginBottom: '0.5rem',
          }}
        >
          Course Title Placeholder
        </h1>
        <p
          css={{
            fontSize: '1.15rem',
            color: '#555',
            lineHeight: '1.6',
          }}
        >
          This is a brief overview of the course, describing what students will learn, the skills they will gain, and the general structure or benefits of the course.
        </p>

        {/* Additional course info or actions could go here, e.g., enroll button */}
        <button
          css={{
            alignSelf: 'start',
            padding: '0.65rem 1.4rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: '#1976d2',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 3px 7px rgba(25, 118, 210, 0.4)',
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            userSelect: 'none',
          }}
          type="button"
          aria-label="Enroll in this course"
        >
          Enroll Now
        </button>
      </section>
    </main>
  );
}
