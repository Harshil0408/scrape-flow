import { getAppUrl } from "@/lib/helper/appUrl";
import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const now = new Date();

    const workflows = await prisma.workflow.findMany({
      select: { id: true },
      where: {
        status: WorkflowStatus.PUBLISHED,
        cron: { not: null },
        nextRunAt: { lte: now },
      },
    });

    for (const workflow of workflows) {
      triggerWorkflow(workflow.id);
    }

    return new Response(JSON.stringify({ workflowsToRun: workflows.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in cron route:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function triggerWorkflow(workflowId: string) {
  const triggerApiUrl = getAppUrl(`api/workflows/execute?workflowId=${workflowId}`);
  fetch(triggerApiUrl, {
    headers: {
      Authorization: `Bearer ${process.env.API_SECRET!}`,
    },
    cache: "no-store",
  }).catch((err) =>
    console.log("Error triggering workflowId", workflowId, err.message)
  );
}
