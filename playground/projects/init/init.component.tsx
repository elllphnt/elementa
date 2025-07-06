export const styles = `
#root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  padding: 1.5rem;
  text-align: center;
  background-color: #f8f8f8;
  color: #2f2f2f;
  font-family: "Plus Jakarta Sans", sans-serif;

  #greeting {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
    opacity: 0.7;
  }

  #project {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  #footer {
    font-size: 0.75rem;
    color: #858585;
  }

  #footer a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  #root {
    background-color: #1b1b1b;
    color: #f8f8f8;

    #greeting {
      color: #858585;
    }

    #footer {
      color: #858585;
    }
  }
}
`;

export interface InitPageProps {
  projectName?: string;
}

function InitPage() {
  return (
    <div id="root">
      <div id="greeting">Welcome to</div>
      <div id="project">Elementa Playground</div>
      <div id="footer">
        powered by{" "}
        <a href="https://elll.dev" target="_blank" rel="noopener noreferrer">
          elll.dev
        </a>
      </div>
    </div>
  );
}

export default InitPage;
