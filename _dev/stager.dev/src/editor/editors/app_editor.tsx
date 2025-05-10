import { useObservable } from "@elllphnt/elementa-react-utils";
import { useState } from "react";
import { File } from "../../state/fs";

export function AppEditor({ file }: { file: File }) {
  const name = useObservable(file.name$, file.name);
  const [view, setView] = useState<"structure" | "preview" | "code">(
    "structure"
  );

  return (
    <div className="app-editor">
      <div className="app-editor-toolbar">
        <div className="editor-tabs">
          <button
            className={view === "structure" ? "active" : ""}
            onClick={() => setView("structure")}
          >
            Structure
          </button>
          <button
            className={view === "preview" ? "active" : ""}
            onClick={() => setView("preview")}
          >
            Preview
          </button>
          <button
            className={view === "code" ? "active" : ""}
            onClick={() => setView("code")}
          >
            Code
          </button>
        </div>
        <div className="editor-actions">
          <button>Save</button>
          <button>Deploy</button>
        </div>
      </div>

      <div className="app-editor-content">
        {view === "structure" && (
          <div className="structure-view">
            <div className="components-list">
              <h3>Components</h3>
              <div className="component-item">
                <span>Header</span>
                <button className="add-btn">+</button>
              </div>
              <div className="component-item">
                <span>MainContent</span>
                <button className="add-btn">+</button>
              </div>
              <div className="component-item">
                <span>Footer</span>
                <button className="add-btn">+</button>
              </div>
            </div>
            <div className="app-structure">
              <div className="app-layout">
                <div className="layout-header">App: {name}</div>
                <div className="layout-component">Header</div>
                <div className="layout-component">
                  MainContent
                  <div className="layout-component nested">ProductList</div>
                  <div className="layout-component nested">Sidebar</div>
                </div>
                <div className="layout-component">Footer</div>
              </div>
            </div>
          </div>
        )}

        {view === "preview" && (
          <div className="preview-view">
            <div className="preview-container">
              <div className="preview-frame">
                <div className="preview-header">
                  <div className="preview-controls">
                    <button>◀</button>
                    <button>⟳</button>
                    <button>▶</button>
                    <input type="text" value="/home" readOnly />
                  </div>
                </div>
                <div className="preview-content">
                  <h2>{name} App</h2>
                  <p>App preview would render here</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "code" && (
          <div className="code-view">
            <textarea
              value={`import React from 'react';

export function ${name}App() {
  return (
    <div className="app-container">
      <Header />
      <main>
        <ProductList />
        <Sidebar />
      </main>
      <Footer />
    </div>
  );
}`}
              readOnly
            />
          </div>
        )}
      </div>

      <style>{`
        .app-editor {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        
        .app-editor-toolbar {
          display: flex;
          justify-content: space-between;
          background-color: #f5f5f5;
          border-bottom: 1px solid #ddd;
          padding: 8px 16px;
        }
        
        .editor-tabs button {
          background: none;
          border: none;
          padding: 6px 12px;
          margin-right: 4px;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .editor-tabs button.active {
          background-color: #e0e0e0;
          font-weight: bold;
        }
        
        .editor-actions {
          display: flex;
          gap: 8px;
        }
        
        .editor-actions button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background-color: #e0e0e0;
        }
        
        .app-editor-content {
          flex: 1;
          overflow: auto;
        }
        
        .structure-view {
          display: grid;
          grid-template-columns: 250px 1fr;
          height: 100%;
        }
        
        .components-list {
          padding: 16px;
          border-right: 1px solid #ddd;
          background-color: #f9f9f9;
          overflow-y: auto;
        }
        
        .component-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-radius: 4px;
          background-color: #eee;
          margin-bottom: 4px;
          cursor: pointer;
        }
        
        .add-btn {
          background: none;
          border: none;
          font-weight: bold;
          cursor: pointer;
          color: #2196f3;
        }
        
        .app-structure {
          padding: 16px;
          overflow: auto;
        }
        
        .app-layout {
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 16px;
          margin: 0 auto;
          max-width: 800px;
        }
        
        .layout-header {
          font-weight: bold;
          margin-bottom: 16px;
          padding: 8px;
          background-color: #e3f2fd;
          border-radius: 4px;
        }
        
        .layout-component {
          margin: 8px 0;
          padding: 12px;
          border: 1px dashed #bbb;
          border-radius: 4px;
          background-color: #f5f5f5;
        }
        
        .nested {
          margin-left: 24px;
          margin-top: 12px;
        }
        
        .preview-view {
          height: 100%;
          padding: 16px;
        }
        
        .preview-container {
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .preview-header {
          padding: 8px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }
        
        .preview-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .preview-controls input {
          flex: 1;
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .preview-frame {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .preview-content {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .code-view {
          height: 100%;
        }
        
        .code-view textarea {
          width: 100%;
          height: 100%;
          padding: 16px;
          border: none;
          font-family: monospace;
          font-size: 14px;
          resize: none;
        }
      `}</style>
    </div>
  );
}
