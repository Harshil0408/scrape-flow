import { AppNode } from "@/types/appNode";
import { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/types/workflow";
import { Edge, getIncomers } from "@xyflow/react";
import { TaskRegistry } from "./task/registry";

type FlowToExecutionPlanType = {
    executionPlan?: WorkflowExecutionPlan;
}

export function FlowToExecutionPlan(
    nodes: AppNode[],
    edges: Edge[]
): FlowToExecutionPlanType {


    const entryPoint = nodes.find(
        (node) => TaskRegistry[node.data.type].isEntryPoint
    );

    if (!entryPoint) {
        throw new Error("TODO: HANDLE THIS ERROR");
    }

    const planned = new Set<string>();
    const executionPlan: WorkflowExecutionPlan = [
        {
            phase: 1,
            nodes: [entryPoint],
        }
    ];

    planned.add(entryPoint.id);

    for (let phase = 2;
        phase <= nodes.length && planned.size < nodes.length;
        phase++
    ) {
        const nextPhase: WorkflowExecutionPlanPhase = { phase, nodes: [] };
        for (const currentNode of nodes) {
            if (planned.has(currentNode.id)) {
                // Node has been already there in planned set;
                continue;
            }
            const invalidInputs = getInvalidInputs(currentNode, edges, planned);
            if (invalidInputs.length > 0) {
                const incomers = getIncomers(currentNode, nodes, edges);
                if (incomers.every(incomer => planned.has(incomer.id))) {
                    // If all incoming incomers/edges are planned and there are still invalid inputs
                    // this means that this particular node has an invalid input
                    // which means that the workflow is invalid.
                    console.error("Invalid inputs", currentNode.id, invalidInputs);
                    throw new Error("TODO: HANDLE ERROR 1");
                } else {
                    continue;
                }
            }

            nextPhase.nodes.push(currentNode)
        }
        for (const node of nextPhase.nodes) {
            planned.add(node.id);
        }
        executionPlan.push(nextPhase);
    }

    return { executionPlan };
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
    const invalidInputs = [];
    const inputs = TaskRegistry[node.data.type].inputs;
    for (const input of inputs) {
        const inputValue = node.data.inputs[input.name];
        const inputValueProvided = inputValue?.length > 0;
        if (inputValueProvided) {
            // this input has value
            continue;
        }
        // If a value is not provided by user then we need to check
        // if there is an output linked to current input
        const incomingEdges = edges.filter((edge) => edge.target === node.id);
        const inputLinkedToOutput = incomingEdges.find(edge => edge.targetHandle === input.name);
        const requiredInputProvidedByVisitedOutput =
            input.required &&
            inputLinkedToOutput &&
            planned.has(inputLinkedToOutput.source);

        if (requiredInputProvidedByVisitedOutput) {
            // the input is required and we have a valid value for it
            // provided by a task that ia already planned
            continue;
        } else if (!input.required) {
            // If the input is not required but there is an output linked to it
            // Then we need to be sure that the output is already planned
            if (!inputLinkedToOutput) continue;
            if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
                // The output is providing a value to the input: the input is fine
                continue;
            }
        }
        invalidInputs.push(input.name);
    }

    return invalidInputs;
}