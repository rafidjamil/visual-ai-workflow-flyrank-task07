import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import DecisionNode from "./components/DecisionNode";
import NodeEditor from "./components/NodeEditor";

const nodeTypes = {
  decision: DecisionNode,
};

const STORAGE_KEY = "visual-ai-workflow";

const initialNodes: Node[] = [
  // Level 1: Root Node
  {
    id: "1",
    type: "decision",
    position: { x: 450, y: 40 },
    data: {
      prompt: "Is the code snippet free of critical security vulnerabilities?",
    },
  },

  // Level 2: Left Branch (YES) & Right Branch (NO)
  {
    id: "2",
    type: "decision",
    position: { x: 180, y: 220 },
    data: {
      prompt: "Does code adhere to guidelines & error handling standards?",
    },
  },
  {
    id: "3",
    type: "decision",
    position: { x: 720, y: 220 },
    data: {
      prompt: "Is this flaw critical SQL Injection or direct code execution?",
    },
  },

  // Level 3: Leaf Branches
  {
    id: "4",
    type: "decision",
    position: { x: 50, y: 420 },
    data: {
      prompt: "Does it pass basic performance & optimization checks?",
    },
  },
  {
    id: "5",
    type: "decision",
    position: { x: 320, y: 420 },
    data: {
      prompt: "Can minor lint errors be auto-fixed by CI pipeline?",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "edge-1-2",
    source: "1",
    sourceHandle: "yes",
    target: "2",
    label: "YES",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2 },
  },
  {
    id: "edge-1-3",
    source: "1",
    sourceHandle: "no",
    target: "3",
    label: "NO",
    animated: true,
    style: { stroke: "#f43f5e", strokeWidth: 2 },
  },
  {
    id: "edge-2-4",
    source: "2",
    sourceHandle: "yes",
    target: "4",
    label: "YES",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2 },
  },
  {
    id: "edge-2-5",
    source: "2",
    sourceHandle: "no",
    target: "5",
    label: "NO",
    animated: true,
    style: { stroke: "#f43f5e", strokeWidth: 2 },
  },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeCount, setNodeCount] = useState(5);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionPath, setExecutionPath] = useState<any[] | null>(null);

  const [showInputModal, setShowInputModal] = useState(false);
  const [userQuery, setUserQuery] = useState(
    "I received a broken laptop screen in my package yesterday, I want my money back."
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedWorkflow = localStorage.getItem(STORAGE_KEY);

    if (savedWorkflow) {
      try {
        const parsedWorkflow = JSON.parse(savedWorkflow);

        if (parsedWorkflow.nodes) {
          setNodes(parsedWorkflow.nodes);
          setNodeCount(parsedWorkflow.nodes.length);
        }

        if (parsedWorkflow.edges) {
          setEdges(parsedWorkflow.edges);
        }
      } catch (error) {
        console.error("Failed to load workflow:", error);
      }
    }

    setIsLoaded(true);
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (!isLoaded) return;

    const workflow = {
      nodes,
      edges,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
  }, [nodes, edges, isLoaded]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edgeLabel =
        connection.sourceHandle === "yes"
          ? "YES"
          : connection.sourceHandle === "no"
            ? "NO"
            : "";

      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            label: edgeLabel,
            animated: true,
            style: {
              stroke: connection.sourceHandle === "yes" ? "#10b981" : "#f43f5e",
              strokeWidth: 2,
            },
          },
          currentEdges
        )
      );
    },
    [setEdges]
  );

  const addDecisionNode = () => {
    const newId = String(nodeCount + 1);

    const newNode: Node = {
      id: newId,
      type: "decision",
      position: {
        x: 200 + Math.random() * 300,
        y: 100 + Math.random() * 300,
      },
      data: {
        prompt: "Enter your AI decision question...",
      },
    };

    setNodes((currentNodes) => [...currentNodes, newNode]);
    setNodeCount((count) => count + 1);
  };

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    setSelectedNodeId(node.id);
  };

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const updatePrompt = (prompt: string) => {
    if (!selectedNodeId) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                prompt,
              },
            }
          : node
      )
    );
  };

  const handleExportJSON = () => {
    const workflow = { nodes, edges };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(workflow, null, 2)
    )}`;

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `ai-workflow-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];

    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          setNodeCount(parsed.nodes.length);
          alert("Workflow imported successfully.");
        } else {
          alert("Invalid workflow file format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };

    fileReader.readAsText(file);
    event.target.value = "";
  };

  const handleResetWorkflow = () => {
    if (confirm("Are you sure you want to reset the workflow to default layout?")) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setNodeCount(initialNodes.length);
      setExecutionPath(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const executeWorkflowWithInput = async () => {
    setShowInputModal(false);
    setIsExecuting(true);
    setExecutionPath(null);

    // Reset Highlights
    setNodes((currentNodes) =>
      currentNodes.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: false, lastDecision: null },
      }))
    );

    try {
      const response = await fetch("http://localhost:5000/api/run-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nodes, edges, initialInput: userQuery }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Execution Event sent to Inngest. Check localhost:8288 for live trace.");
      } else {
        alert("Failed to trigger workflow: " + data.error);
      }
    } catch (error) {
      console.error("Error triggering workflow:", error);
      alert("Could not connect to backend server. Make sure Express server is running on port 5000.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-slate-950 text-slate-100">
      {/* Professional Top Navigation Toolbar */}
      <div className="absolute left-6 top-6 z-10 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setShowInputModal(true)}
          disabled={isExecuting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold tracking-wide text-white transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{isExecuting ? "Executing Pipeline..." : "Run Workflow"}</span>
        </button>

        <div className="h-4 w-px bg-slate-800" />

        <button
          onClick={addDecisionNode}
          className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 active:scale-95"
        >
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Node</span>
        </button>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 active:scale-95"
        >
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export JSON</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 active:scale-95"
        >
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Import JSON</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportJSON}
          accept=".json"
          className="hidden"
        />

        <div className="h-4 w-px bg-slate-800" />

        <button
          onClick={handleResetWorkflow}
          className="flex items-center gap-2 rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-2 text-xs font-medium text-rose-300 transition-all hover:border-rose-800 hover:bg-rose-900/50 active:scale-95"
        >
          <svg className="h-3.5 w-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset Layout</span>
        </button>
      </div>

      {/* Input Context Prompt Modal */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-1 text-base font-bold text-slate-100">
              Execute Workflow Engine
            </h3>
            <p className="mb-4 text-xs text-slate-400">
              Provide input evaluation context for Gemini AI to process down the visual graph:
            </p>
            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setShowInputModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={executeWorkflowWithInput}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-indigo-500"
              >
                Start Execution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Path Sidebar Panel */}
      {executionPath && (
        <div className="absolute right-6 top-6 z-20 w-80 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Execution Summary
            </h4>
            <button
              onClick={() => setExecutionPath(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Input Context:</span>{" "}
              "{userQuery}"
            </div>

            <div className="space-y-2">
              {executionPath.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-xs"
                >
                  <span className="font-medium text-slate-300">
                    Node {step.nodeId}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
                      step.decision === "YES"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                        : "bg-rose-950 text-rose-400 border border-rose-800/50"
                    }`}
                  >
                    {step.decision}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="!border-slate-800 !bg-slate-900/90 !text-slate-300 fill-slate-300" />
        <MiniMap
          nodeColor="#1e293b"
          maskColor="rgba(15, 23, 42, 0.7)"
          className="!border-slate-800 !bg-slate-900"
        />
      </ReactFlow>

      {/* Node Prompt Editor Sidebar */}
      {selectedNode && (
        <NodeEditor
          prompt={String(selectedNode.data.prompt || "")}
          onSave={(prompt) => updatePrompt(prompt)}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}

export default App;