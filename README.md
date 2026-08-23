# ⚡ Visual AI Decision Workflow Studio

An interactive, visual workflow execution engine that combines **React Flow**, **Express.js**, **Inngest**, and the **Google Gemini API**. 

This application allows developers to visually architect complex branching decision trees. When triggered with user context (e.g., customer queries or system evaluations), the background workflow engine dynamically passes data through each decision node, utilizing Google's Gemini LLM to make context-aware routing decisions down the node graph.

---

## 🏗 System Architecture & Flow

[ User Input / Context ]
│
▼
┌──────────────┐      HTTP POST      ┌──────────────────┐
│  React Flow  │ ──────────────────> │  Express Server  │
│  Studio UI   │                     │   (/api/run)     │
└──────────────┘                     └────────┬─────────┘
▲                                     │ Emits Event
│ WebSocket/Polling                   ▼
┌──────────────┐ Dynamic Routing  ┌──────────────────────┐
│ Execution    │ <─────────────── │  Inngest Workflow    │
│ Results      │                  │  Engine (Gemini API) │
└──────────────┘                  └──────────────────────┘

### How It Works

1. **Visual Graph Design**: Users create, connect, and configure decision nodes on an interactive React Flow canvas.
2. **Context Trigger**: The user inputs execution context (e.g., *"I received a broken laptop screen in my package..."*).
3. **Event Emitting**: The frontend dispatches the tree graph and user query to the Express backend.
4. **Step-by-Step AI Evaluation**:
   - Inngest picks up the initial root decision node.
   - It sends the current node question along with the input context to the **Gemini API**.
   - Gemini evaluates the condition and returns a boolean response (`YES` or `NO`).
5. **Dynamic Branching**:
   - If `YES` $\rightarrow$ The workflow traverses down the **Green Edge** to the next connected node.
   - If `NO` $\rightarrow$ The workflow traverses down the **Red Edge** to the designated fallback node.
6. **Execution Trace**: Real-time status, execution paths, and decision metrics are rendered back to the user interface and tracked in the Inngest Dev Server.

---

## 🛠 Tech Stack

| Domain | Tool / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite | Modern UI application layer |
| **Canvas Engine** | `@xyflow/react` (React Flow) | Node-based visual graph builder & state manager |
| **Styling** | Tailwind CSS | Clean, enterprise dark studio theme |
| **Backend** | Node.js, Express.js | API backend & trigger gateway |
| **Workflow Engine**| Inngest | Event-driven background queue & workflow orchestrator |
| **AI Intelligence**| `@google/genai` (Gemini API) | Dynamic decision evaluation engine |

---

## 📁 Repository Structure

```text
visual-ai-workflow/
├── backend/
│   ├── inngest/
│   │   ├── client.js      # Inngest client initialization
│   │   └── functions.js   # Gemini evaluation step pipeline
│   ├── .env               # Environment secrets (GEMINI_API_KEY)
│   ├── package.json       # Backend dependencies
│   └── server.js          # Express server endpoints
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DecisionNode.tsx # Custom React Flow Node styling
│   │   │   └── NodeEditor.tsx   # Node question sidebar drawer
│   │   ├── App.tsx             # Canvas layout & toolbar controller
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global Tailwind directives
│   └── package.json            # Frontend dependencies
├── .gitignore             # Git exclusion rules
└── README.md              # Documentation