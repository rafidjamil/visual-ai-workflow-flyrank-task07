// backend/inngest/functions.js
import { inngest } from "./client.js";

export const executeWorkflow = inngest.createFunction(
  { 
    id: "execute-ai-workflow",
    triggers: [{ event: "workflow/execute" }]
  },
  async ({ event, step }) => {
    const { nodes, edges } = event.data;

    console.log("Starting Workflow Execution for nodes:", nodes?.length || 0);

    const executionResult = await step.run("process-nodes", async () => {
      return {
        status: "success",
        processedNodes: nodes ? nodes.map((n) => n.id) : [],
      };
    });

    return { result: executionResult };
  }
);