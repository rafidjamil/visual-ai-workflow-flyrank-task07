import React, { useState } from 'react';
import { type Node, type Edge } from '@xyflow/react';

interface WorkflowRunnerProps {
  nodes: Node[];
  edges: Edge[];
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>;
}

export function WorkflowRunner({ nodes, edges }: WorkflowRunnerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<unknown[]>([]);

  const handleRunWorkflow = async () => {
    setLoading(true);
    setExecutionLogs([]);

    try {
      const response = await fetch('http://localhost:5000/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Workflow triggered successfully on Inngest!');
      }
    } catch (err) {
      console.error('Workflow execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      <button 
        onClick={handleRunWorkflow} 
        disabled={loading}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? 'Running AI Nodes...' : '⚡ Run Workflow'}
      </button>
      {executionLogs.length > 0 && <span>Logs: {executionLogs.length}</span>}
    </div>
  );
}