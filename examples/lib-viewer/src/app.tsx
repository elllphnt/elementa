import { useState } from "react";
import "./App.css";
import ContentViewer from "./components/ContentViewer.js";
import Sidebar from "./components/Sidebar.js";

function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  return (
    <div className="app-container">
      <div
        style={{
          width: 280,
          flexShrink: 0,
        }}
      >
        <Sidebar onFileSelect={handleFileSelect} selectedFile={selectedFile} />
      </div>
      <div
        style={{
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {selectedFile ? (
          <ContentViewer path={selectedFile} />
        ) : (
          <h1>Select a file to view its content</h1>
        )}
      </div>
    </div>
  );
}

export default App;
