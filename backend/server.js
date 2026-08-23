import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { serve } from "inngest/express";
import { inngest, executeWorkflow } from "./inngest/client.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Inngest Endpoint for serve function
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [executeWorkflow],
  })
);

// Trigger Workflow API Endpoint
app.post("/api/run-workflow", async (req, res) => {
  try {
    const { nodes, edges, initialInput } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({
        success: false,
        error: "Nodes and edges are required.",
      });
    }

    const { ids } = await inngest.send({
      name: "workflow/execute",
      data: { nodes, edges, initialInput },
    });

    res.json({
      success: true,
      message: "Workflow triggered successfully",
      runId: ids[0],
    });
  } catch (error) {
    console.error("Error triggering workflow:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});