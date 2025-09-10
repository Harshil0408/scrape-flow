"use client"

import { CreateFlowNode } from "@/lib/workflow/create-workflow-node";
import { TaskType } from "@/types/task";
import { Workflow } from "@prisma/client"
import { addEdge, Background, BackgroundVariant, Connection, Controls, Edge, getOutgoers, MiniMap, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react"

import "@xyflow/react/dist/style.css";
import NodeComponent from "./nodes/node-component";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { AppNode } from "@/types/appNode";
import DeletableEdge from "./edges/delete-edges";
import { TaskRegistry } from "@/lib/workflow/task/registry";

const nodeTypes = {
    FlowScrapeNode: NodeComponent
}

const edgeTypes = {
    default: DeletableEdge
}

const snapGrid: [number, number] = [50, 50];
const fitViewOptions = { padding: 1 }

const FlowEditor = ({ workflow }: { workflow: Workflow }) => {

    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();

    useEffect(() => {
        try {
            const flow = JSON.parse(workflow.definition);
            if (!flow) return;
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (!flow.viewport) return;
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setViewport({ x, y, zoom });
        } catch (error) {
            toast.error("Something went wrong!")
        }
    }, [workflow.definition, setEdges, setNodes, setViewport]);

    const onDropOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const taskType = event.dataTransfer.getData("application/reactflow");
        if (taskType === undefined || !taskType) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        });

        const newNode = CreateFlowNode(taskType as TaskType, position);
        setNodes((nds) => nds.concat(newNode))
    }, [screenToFlowPosition, setNodes]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onFlowConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge({ ...connection, animated: true }, eds));

        if (!connection.targetHandle || !connection.sourceHandle) return;

        const targetNode = nodes.find(nd => nd.id === connection.target);
        if (!targetNode) return;

        const sourceNode = nodes.find(nd => nd.id === connection.source);
        if (!sourceNode) return;

        const sourceValue = sourceNode.data.outputs?.[connection.sourceHandle] ?? "";

        updateNodeData(targetNode.id, {
            inputs: {
                ...targetNode.data.inputs,
                [connection.targetHandle]: sourceValue
            }
        });
    }, [setEdges, updateNodeData, nodes]);

    const isValidConnection = useCallback((
        connection: Edge | Connection
    ) => {
        if (connection.source === connection.target) {
            return false;
        }
        const source = nodes.find((node) => node.id === connection.source);
        const target = nodes.find((node) => node.id === connection.target);

        if (!source || !target) {
            toast.error("Invalid connection: source or target node not found");
            return false;
        }

        const sourceTask = TaskRegistry[source.data.type];
        const targetTask = TaskRegistry[target.data.type];

        const output = sourceTask.outputs.find(
            (o) => o.name === connection.sourceHandle
        );

        const input = targetTask.inputs.find(
            (o) => o.name === connection.targetHandle
        );

        if (input?.type !== output?.type) {
            return false;
        }

        const hasCycle = (node: AppNode, visited = new Set()) => {
            if (visited.has(node.id)) return false;
            visited.add(node.id);

            for (const outgoer of getOutgoers(node, nodes, edges)) {
                if (outgoer.id === connection.source) return true;
                if (hasCycle(outgoer, visited)) return true;
            }
        };

        const detectedCycle = hasCycle(target);
        return !detectedCycle;
    }, [nodes, edges]);

    return (
        <main className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                snapToGrid
                snapGrid={snapGrid}
                fitViewOptions={fitViewOptions}
                onDragOver={onDragOver}
                onDrop={onDropOver}
                onConnect={onFlowConnect}
                isValidConnection={isValidConnection}
            >
                <Controls position="top-left" fitViewOptions={fitViewOptions} />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </main>
    )
}

export default FlowEditor
