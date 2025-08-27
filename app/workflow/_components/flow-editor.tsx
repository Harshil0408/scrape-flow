"use client"

import { CreateFlowNode } from "@/lib/workflow/create-workflow-node";
import { TaskType } from "@/types/task";
import { Workflow } from "@prisma/client"
import { addEdge, Background, BackgroundVariant, Connection, Controls, Edge, MiniMap, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react"

import "@xyflow/react/dist/style.css";
import NodeComponent from "./nodes/node-component";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { AppNode } from "@/types/appNode";
import DeletableEdge from "./edges/delete-edges";

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
        console.log("taskType=======", taskType)
        if (taskType === undefined || !taskType) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        });

        const newNode = CreateFlowNode(taskType as TaskType, position);
        setNodes((nds) => nds.concat(newNode))
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onFlowConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge({ ...connection, animated: true }, eds));

        if (!connection.targetHandle || !connection.sourceHandle) return;

        // Find the target node
        const targetNode = nodes.find(nd => nd.id === connection.target);
        if (!targetNode) return;

        // Find the source node
        const sourceNode = nodes.find(nd => nd.id === connection.source);
        if (!sourceNode) return;

        // Get the value from the source node's outputs
        const sourceValue = sourceNode.data.outputs?.[connection.sourceHandle] ?? "";

        // Update the target node input with the source node value
        updateNodeData(targetNode.id, {
            inputs: {
                ...targetNode.data.inputs,
                [connection.targetHandle]: sourceValue
            }
        });
    }, [setEdges, updateNodeData, nodes]);
    console.log("@NODES", nodes);

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
            >
                <Controls position="top-left" fitViewOptions={fitViewOptions} />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </main>
    )
}

export default FlowEditor
