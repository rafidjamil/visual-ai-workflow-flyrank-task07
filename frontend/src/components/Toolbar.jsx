import React, { useRef } from 'react';

export default function Toolbar({ nodes, edges, setNodes, setEdges, onSave, onLoad }) {
  const fileInputRef = useRef(null);

  // Export Workflow as JSON File
  const handleExport = () => {
    const workflowData = {
      nodes,
      edges,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(workflowData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `ai-workflow-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Workflow from JSON File
  const handleImport = (event) => {
    const fileReader = new FileReader();
    const file = event.target.files[0];

    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          alert('Workflow imported successfully!');
        } else {
          alert('Invalid workflow JSON structure.');
        }
      } catch (error) {
        alert('Error parsing JSON file.');
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div style={{ padding: '10px', background: '#1e1e2f', color: '#fff', display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button onClick={onSave} style={btnStyle}>💾 Save to Storage</button>
      <button onClick={onLoad} style={btnStyle}>🔄 Reload Storage</button>
      <button onClick={handleExport} style={btnStyle}>📥 Export JSON</button>
      
      <button onClick={() => fileInputRef.current?.click()} style={btnStyle}>📤 Import JSON</button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        style={{ display: 'none' }}
      />
    </div>
  );
}

const btnStyle = {
  padding: '8px 14px',
  borderRadius: '6px',
  border: 'none',
  background: '#4f46e5',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: '500'
};