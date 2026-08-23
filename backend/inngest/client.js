import { Inngest } from "inngest";
import { GoogleGenAI } from "@google/genai";

export const inngest = new Inngest({ id: "visual-ai-workflow" });

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    triggers: [{ event: "workflow/execute" }],
  },
  async ({ event, step }) => {
    const { nodes, edges, initialInput } = event.data;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const executionResult = await step.run("process-nodes", async () => {
      let currentNode = nodes.find((n) => n.id === "1") || nodes[0];
      const executionPath = [];

      while (currentNode) {
        const promptText = currentNode.data?.prompt || "Is this valid?";

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash", // Error message ke mutabiq updated model
          contents: `Input Context: "${initialInput || "Customer needs help with support"}"\nQuestion: "${promptText}"`,
          config: {
            systemInstruction:
              'You are an AI decision node in a workflow engine. Evaluate the input context against the question. You MUST reply ONLY with a JSON object: {"decision": "YES"} or {"decision": "NO"}. Do not add markdown backticks.',
            responseMimeType: "application/json",
          },
        });

        const rawText = (response.text || "").replace(/```json|```/g, "").trim();
        const resContent = JSON.parse(rawText);
        const decision = resContent.decision?.toUpperCase() === "YES" ? "YES" : "NO";

        executionPath.push({
          nodeId: currentNode.id,
          prompt: promptText,
          decision,
        });

        const nextEdge = edges.find(
          (e) =>
            e.source === currentNode.id &&
            e.label?.toUpperCase() === decision
        );

        if (!nextEdge) break;

        currentNode = nodes.find((n) => n.id === nextEdge.target);
      }

      return executionPath;
    });

    return {
      success: true,
      path: executionResult,
    };
  }
);