import "server-only";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import {
    ExecutionPhaseStatus,
    WorkflowExecutionStatus,
} from "@/types/workflow";
import { ExecutionPhase } from "@prisma/client";
import { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";
import { ExecutorRegistry } from "./executor/registry";
import { Environment } from "@/types/executor";

export async function ExecuteWorkFlow(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
        where: { id: executionId },
        include: { workflow: true, phases: true },
    });

    if (!execution) {
        throw new Error("Execution not found");
    }

    const environment: Environment = { phases: {} };

    await initializeWorkflowExecution(executionId, execution.workflowId);
    await initializePhasesStatuses(execution);

    let creditsConsumed = 0;
    let executionFailed = false;

    for (const phase of execution.phases) {
        const phaseExecution = await executeWorkflowPhase(phase, environment);
        if (!phaseExecution.success) {
            executionFailed = true;
            break;
        }
    }

    await finalizeWorkflowExecution(
        executionId,
        execution.workflowId,
        executionFailed,
        creditsConsumed
    );

    revalidatePath("/workflow/runs");
}

async function initializeWorkflowExecution(
    executionId: string,
    workflowId: string
) {
    await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
            startedAt: new Date(),
            status: WorkflowExecutionStatus.RUNNING,
        },
    });

    await prisma.workflow.update({
        where: { id: workflowId },
        data: {
            lastRunAt: new Date(),
            lastRunStatus: WorkflowExecutionStatus.RUNNING,
            lastRunId: executionId,
        },
    });
}

async function initializePhasesStatuses(execution: any) {
    await prisma.executionPhase.updateMany({
        where: {
            id: {
                in: execution.phases.map((phase: any) => phase.id),
            },
        },
        data: {
            status: ExecutionPhaseStatus.PENDING,
        },
    });
}

async function finalizeWorkflowExecution(
    executionId: string,
    workflowId: string,
    executionFailed: boolean,
    creditsConsumed: number
) {
    const finalStatus = executionFailed
        ? WorkflowExecutionStatus.FAILED
        : WorkflowExecutionStatus.COMPLETED;

    await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
            status: finalStatus,
            completedAt: new Date(),
            creditsConsumed,
        },
    });

    await prisma.workflow
        .update({
            where: { id: workflowId },
            data: { lastRunStatus: finalStatus },
        })
        .catch((err) => {
            console.log(err);
        });
}

async function executeWorkflowPhase(phase: ExecutionPhase, environment: Environment) {
    const startedAt = new Date();
    const node = JSON.parse(phase.node) as AppNode;
    setupEnvironmentPhase(node, environment);

    await prisma.executionPhase.update({
        where: { id: phase.id },
        data: {
            status: ExecutionPhaseStatus.RUNNING,
            startedAt,
        },
    });

    const creditsRequired = TaskRegistry[node.data.type].credits;
    console.log(
        `Executing phase ${phase.name} with ${creditsRequired} credits required`
    );

    const success = await executePhase(phase, node, environment);

    await finalizePhase(phase.id, success);

    return { success };
}

async function finalizePhase(phaseId: string, success: boolean) {
    const finalStatus = success
        ? ExecutionPhaseStatus.COMPLETED
        : ExecutionPhaseStatus.FAILED;

    await prisma.executionPhase.update({
        where: { id: phaseId },
        data: {
            status: finalStatus,
            completedAt: new Date(),
        },
    });
}

async function executePhase(
    phase: ExecutionPhase,
    node: AppNode,
    environment: Environment
): Promise<boolean> {
    const runFn = ExecutorRegistry[node.data.type];
    if (!runFn) {
        return false;
    }

    return await runFn(environment);
}

function setupEnvironmentPhase(node: AppNode, environment: Environment) {
    environment.phases[node.id] = { inputs: {}, outputs: {} }
}
