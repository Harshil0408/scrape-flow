"use server"

import prisma from "@/lib/prisma";
import { FlowToExecutionPlan } from "@/lib/workflow/execution-plan";
import { WorkflowExecutionPlan } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server"

export async function RunWorkFlow(form: { workflowId: string, flowDefinition?: string }) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthenticated")
    }

    const { workflowId, flowDefinition } = form;

    if (!workflowId) {
        throw new Error("workflowId is required")
    }

    const workflow = await prisma.workflow.findUnique({
        where: {
            userId,
            id: workflowId
        },
    });

    if (!workflow) {
        throw new Error("Workflow not found")
    }

    let executionPlan: WorkflowExecutionPlan;

    if (!flowDefinition) {
        throw new Error("flow definition is not defined")
    }

    const flow = JSON.parse(flowDefinition);

    const result = FlowToExecutionPlan(flow.nodes, flow.edges);

    if (result.error) {
        throw new Error("Flow definition is not valid")
    }

    if (!result.executionPlan) {
        throw new Error("No execution plan generated")
    }

    executionPlan = result.executionPlan;

    console.log("Execution plan", executionPlan);

}