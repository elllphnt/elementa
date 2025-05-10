import { useObservable } from "@elllphnt/elementa-react-utils";
import { useState } from "react";
import { File } from "../../state/fs";

export function ComponentEditor({ file }: { file: File }) {
  const name = useObservable(file.name$, file.name);
  const [code, setCode] = useState(`import React from 'react';

export function ${name}() {
  return (
    <div>
      <h2>${name} Component</h2>
      {/* Component content here */}
    </div>
  );
}`);

  const [preview, setPreview] = useState(false);

  return (
    <div className="component-editor">
      <div className="editor-toolbar">
        <div className="editor-tabs">
          <button
            className={!preview ? "active" : ""}
            onClick={() => setPreview(false)}
          >
            Edit
          </button>
          <button
            className={preview ? "active" : ""}
            onClick={() => setPreview(true)}
          >
            Preview
          </button>
        </div>
        <div className="editor-actions">
          <button>Save</button>
        </div>
      </div>

      <div className="editor-content">
        {preview ? (
          <div className="component-preview">
            <div className="preview-container">
              <div className="preview-frame">
                <div className="preview-content">
                  <h2>{name} Component</h2>
                  <p>Component preview would render here</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="code-editor">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
          </div>
        )}
      </div>

      <div className="properties-panel">
        <h3>Properties</h3>
        <div className="property-row">
          <label>Name:</label>
          <input type="text" value={name} readOnly />
        </div>
        <div className="property-row">
          <label>Props:</label>
          <button className="add-prop-btn">+ Add Prop</button>
        </div>
        <div className="property-list">
          <div className="property-item">
            <span>title: string</span>
            <button className="remove-btn">×</button>
          </div>
          <div className="property-item">
            <button className="remove-btn">×</button>
          </div>
        </div>
      </div>

      <style>{`
        .component-editor {
          display: grid;
          grid-template-columns: 1fr 250px;
          grid-template-rows: auto 1fr;
          height: 100%;
          overflow: hidden;
        }
        
        .editor-toolbar {
          grid-column: 1 / 2;
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
        
        .editor-content {
          grid-column: 1 / 2;
          grid-row: 2 / 3;
          overflow: auto;
        }
        
        .code-editor {
          height: 100%;
        }
        
        .code-editor textarea {
          width: 100%;
          height: 100%;
          padding: 12px;
          border: none;
          font-family: monospace;
          font-size: 14px;
          resize: none;
        }
        
        .properties-panel {
          grid-column: 2 / 3;
          grid-row: 1 / 3;
          border-left: 1px solid #ddd;
          padding: 16px;
          background-color: #f9f9f9;
          overflow-y: auto;
        }
        
        .properties-panel h3 {
          margin-top: 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #ddd;
        }
        
        .property-row {
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
        }
        
        .property-row label {
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .property-row input {
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .add-prop-btn {
          background-color: #e0e0e0;
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
          width: 100%;
          cursor: pointer;
          margin-top: 4px;
        }
        
        .property-list {
          margin-top: 12px;
        }
        
        .property-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background-color: #eee;
          border-radius: 4px;
          margin-bottom: 4px;
        }
        
        .remove-btn {
          background: none;
          border: none;
          color: #f44336;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        }
        
        .component-preview {
          height: 100%;
          padding: 12px;
          display: flex;
          flex-direction: column;
        }
        
        .preview-container {
          flex: 1;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12px;
          overflow: auto;
        }
        
        .preview-frame {
          background-color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          height: 100%;
        }
        
        .preview-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
