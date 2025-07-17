import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Component() {
  const { courseId, lessonId } = useParams();

  // Placeholder lesson data
  const lessons = [
    { id: 'intro', title: 'Introduction' },
    { id: 'lesson1', title: 'Lesson 1: Basics' },
    { id: 'lesson2', title: 'Lesson 2: Intermediate' },
    { id: 'conclusion', title: 'Conclusion' },
  ];

  const currentLessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  const currentLesson = lessons[currentLessonIndex] || { title: 'Lesson not found' };

  // Navigation targets
  const prevLesson = lessons[currentLessonIndex - 1];
  const nextLesson = lessons[currentLessonIndex + 1];

  return (
    <main
      css={{
        maxWidth: '800px',
        margin: '2rem auto',
        fontFamily: 'Arial, sans-serif',
        color: '#222',
        padding: '0 1rem',
      }}
    >
      <h1
        css={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1565c0',
          marginBottom: '1rem',
          userSelect: 'none',
        }}
      >
        {currentLesson.title}
      </h1>

      <article
        css={{
          fontSize: '1.1rem',
          lineHeight: '1.6',
          color: '#444',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          minHeight: '300px',
          marginBottom: '2rem',
          userSelect: 'text',
          // Placeholder content style
          '&::before': {
            content: '"Lesson content goes here..."',
            color: '#aaa',
            fontStyle: 'italic',
          },
        }}
      />

      <nav
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: '600',
        }}
      >
        {prevLesson ? (
          <Link
            to={`/courses/${courseId}/lessons/${prevLesson.id}`}
            css={{
              color: '#1976d2',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              '&:hover': { color: '#0d47a1' },
            }}
            aria-label={`Go to previous lesson: ${prevLesson.title}`}
          >
            ← {prevLesson.title}
          </Link>
        ) : (
          <span css={{ visibility: 'hidden' }}>No previous lesson</span>
        )}

        {nextLesson ? (
          <Link
            to={`/courses/${courseId}/lessons/${nextLesson.id}`}
            css={{
              color: '#1976d2',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              '&:hover': { color: '#0d47a1' },
            }}
            aria-label={`Go to next lesson: ${nextLesson.title}`}
          >
            {nextLesson.title} →
          </Link>
        ) : (
          <span css={{ visibility: 'hidden' }}>No next lesson</span>
        )}
      </nav>
    </main>
  );
}
