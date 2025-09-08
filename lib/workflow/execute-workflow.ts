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
import { Environment, ExecutionEnvironment } from "@/types/executor";
import { TaskParamType } from "@/types/task";
import { Browser, Page } from "puppeteer";
import { Edge } from "@xyflow/react";
import { LogCollector } from "@/types/log";
import { createLogCollector } from "../log";

export async function ExecuteWorkFlow(executionId: string, nextRunAt?: Date) {
    const execution = await prisma.workflowExecution.findUnique({
        where: { id: executionId },
        include: { workflow: true, phases: true },
    });

    if (!execution) {
        throw new Error("Execution not found");
    }

    const edges = JSON.parse(execution.definition).edges as Edge[];

    const environment: Environment = { phases: {} };

    await initializeWorkflowExecution(executionId, execution.workflowId, nextRunAt);
    await initializePhasesStatuses(execution);


    let creditsConsumed = 0;
    let executionFailed = false;

    for (const phase of execution.phases) {
        const phaseExecution = await executeWorkflowPhase(phase, environment, edges, execution.userId);
        creditsConsumed += phaseExecution.creditsConsumed;
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

    await cleanupEnvironment(environment);

    revalidatePath("/workflow/runs");
}

async function initializeWorkflowExecution(
    executionId: string,
    workflowId: string,
    nextRunAt?: Date
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
            ...(nextRunAt && { nextRunAt })
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

async function executeWorkflowPhase(phase: ExecutionPhase, environment: Environment, edges: Edge[], userId: string) {
    const logCollector = createLogCollector();
    const startedAt = new Date();
    const node = JSON.parse(phase.node) as AppNode;
    setupEnvironmentPhase(node, environment, edges);

    await prisma.executionPhase.update({
        where: { id: phase.id },
        data: {
            status: ExecutionPhaseStatus.RUNNING,
            startedAt,
            inputs: JSON.stringify(environment.phases[node.id].inputs),
        },
    });

    const creditsRequired = TaskRegistry[node.data.type].credits;

    let success = await decrementCredits(userId, creditsRequired, logCollector);
    const creditsConsumed = success ? creditsRequired : 0;
    if (success) {
        success = await executePhase(phase, node, environment, logCollector);
    }
    const outputs = environment.phases[node.id].outputs;
    await finalizePhase(phase.id, success, outputs, logCollector, creditsConsumed);

    return { success, creditsConsumed };
}

async function finalizePhase(phaseId: string, success: boolean, outputs: any, logCollector: LogCollector, creditsConsumed: number) {
    const finalStatus = success
        ? ExecutionPhaseStatus.COMPLETED
        : ExecutionPhaseStatus.FAILED;

    await prisma.executionPhase.update({
        where: { id: phaseId },
        data: {
            status: finalStatus,
            completedAt: new Date(),
            outputs: JSON.stringify(outputs),
            creditsConsumed,
            logs: {
                createMany: {
                    data: logCollector.getAll().map(log => ({
                        message: log.message,
                        timestamp: log.timestamp,
                        logLevel: log.level,
                    }))
                }
            }
        },
    });
}

async function executePhase(
    phase: ExecutionPhase,
    node: AppNode,
    environment: Environment,
    logCollector: LogCollector
): Promise<boolean> {
    const runFn = ExecutorRegistry[node.data.type];
    if (!runFn) {
        return false;
    }

    const executionEnvironment: ExecutionEnvironment<any> = createExecutionEnvironment(node, environment, logCollector);

    return await runFn(executionEnvironment);
}

function setupEnvironmentPhase(node: AppNode, environment: Environment, edges: Edge[]) {
    environment.phases[node.id] = { inputs: {}, outputs: {} };
    const inputsDefinition = TaskRegistry[node.data.type].inputs;
    for (const input of inputsDefinition) {
        if (input.type === TaskParamType.BROWSER_INSTANCE) continue;
        const inputValue = node.data.inputs[input.name];
        if (inputValue) {
            environment.phases[node.id].inputs[input.name] = inputValue;
            continue;
        }
        const connectedEdges = edges.find(edge => edge.target === node.id && edge.targetHandle === input.name);
        if (!connectedEdges) {
            console.log("Missing edge for input", input.name, "node id:", node.id);
            continue;
        }

        const outputValue = environment.phases[connectedEdges.source].outputs[connectedEdges.sourceHandle!];

        environment.phases[node.id].inputs[input.name] = outputValue;
    }
}

function createExecutionEnvironment(node: AppNode, environment: Environment, logCollector: LogCollector): ExecutionEnvironment<any> {
    return {
        getInput: (name: string) => environment.phases[node.id]?.inputs[name],
        setOutput: (name: string, value: string) => {
            environment.phases[node.id].outputs[name] = value;
        },
        getBrowser: () => environment.browser,
        setBrowser: (browser: Browser) => (environment.browser = browser),
        getPage: () => environment.page,
        setPage: (page: Page) => (environment.page = page),
        log: logCollector
    }
}

async function cleanupEnvironment(environment: Environment) {
    if (environment.browser) {
        await environment.browser.close().catch(err => console.log("Unable to close the browser!"))
    }
}

async function decrementCredits(userId: string, amount: number, logCollector: LogCollector) {
    try {
        await prisma.userBalance.update({
            where: { userId, credits: { gte: amount } },
            data: { credits: { decrement: amount } }
        });
        return true;
    } catch (error) {
        console.log("Error in decrement credits", error);
        logCollector.error("insufficient balance");
        return false;
    }
}
