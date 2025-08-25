"use client"

import { CreateFlowNode } from "@/lib/workflow/create-workflow-node";
import { TaskType } from "@/types/task";
import { Workflow } from "@prisma/client"
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react"

import "@xyflow/react/dist/style.css";
import NodeComponent from "./nodes/node-component";
import { useEffect } from "react";
import { toast } from "sonner";

const nodeTypes = {
    FlowScrapeNode: NodeComponent
}

const snapGrid: [number, number] = [50, 50];
const fitViewOptions = { padding: 1 }

const FlowEditor = ({ workflow }: { workflow: Workflow }) => {

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { setViewport } = useReactFlow();

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
    }, [workflow.definition, setEdges, setNodes, setViewport])

    return (
        <main className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                snapToGrid
                snapGrid={snapGrid}
                fitViewOptions={fitViewOptions}
            >
                <Controls position="top-left" fitViewOptions={fitViewOptions} />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </main>
    )
}

export default FlowEditor
