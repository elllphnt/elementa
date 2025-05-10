import { useObservable } from "@elllphnt/elementa-react-utils";
import { useState } from "react";
import { File } from "../../state/fs";
import { fileTypes } from "../../state/types";

export function TextEditor({ file }: { file: File }) {
  const name = useObservable(file.name$, file.name);
  const fileType = useObservable(file.type$, file.type);

  // Generate placeholder content based on file type
  const getInitialContent = () => {
    switch (fileType) {
      case fileTypes.hook:
        return `import { useState, useEffect } from 'react';

export function use${name}() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Initialize hook
    
    return () => {
      // Cleanup
    };
  }, []);
  
  return {
    data,
    // Additional functions and state
  };
}`;

      case fileTypes.routine:
        return `export function ${name}() {
  // Routine implementation
  
  return {
    execute: () => {
      // Execute the routine
    }
  };
}`;

      case fileTypes.context:
        return `import React, { createContext, useContext, useState } from 'react';

interface ${name}ContextType {
  // Define context value type
  value: string;
  setValue: (value: string) => void;
}

const ${name}Context = createContext<${name}ContextType | undefined>(undefined);

export function ${name}Provider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState('');
  
  return (
    <${name}Context.Provider value={{ value, setValue }}>
      {children}
    </${name}Context.Provider>
  );
}

export function use${name}() {
  const context = useContext(${name}Context);
  
  if (context === undefined) {
    throw new Error('use${name} must be used within a ${name}Provider');
  }
  
  return context;
}`;

      case fileTypes.primitive:
        return `import React from 'react';

interface ${name}Props {
  // Define props
  label: string;
  onClick: () => void;
}

export function ${name}({ label, onClick }: ${name}Props) {
  return (
    <div className="${name.toLowerCase()}-primitive" onClick={onClick}>
      {label}
    </div>
  );
}`;

      default:
        return `// ${name} file content
// Type: ${fileType}

// Add your content here
`;
    }
  };

  const [content, setContent] = useState(getInitialContent());

  return (
    <div className="text-editor">
      <div className="editor-toolbar">
        <div className="file-info">
          <span className="file-name">{name}</span>
          <span className="file-type">{fileType}</span>
        </div>
        <div className="editor-actions">
          <button>Save</button>
        </div>
      </div>

      <div className="editor-container">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
        />
      </div>

      <style>{`
        .text-editor {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }

        .file-info {
          display: flex;
          align-items: center;
        }

        .file-name {
          font-weight: bold;
          margin-right: 8px;
        }

        .file-type {
          color: #666;
          background-color: #e0e0e0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .editor-actions button {
          padding: 6px 12px;
          background-color: #e0e0e0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .editor-container {
          flex: 1;
          overflow: hidden;
        }

        textarea {
          width: 100%;
          height: 100%;
          border: none;
          resize: none;
          padding: 16px;
          font-family: monospace;
          font-size: 14px;
        }

        textarea:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
