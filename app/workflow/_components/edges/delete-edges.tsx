"use client";

import { Button } from "@/components/ui/button";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, useReactFlow } from "@xyflow/react";
import { MinusIcon } from "lucide-react";

const DeletableEdge = (props: EdgeProps) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath(props);
    const { setEdges } = useReactFlow();

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={props.markerEnd} style={props.style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: "all", // or "none" depending on whether you want it clickable
                        fontSize: 12,
                        padding: 4,
                        background: "white",
                        borderRadius: 4,
                    }}
                    className="nodrag nopan"
                >
                    <Button
                        variant={"outline"}
                        size={"icon"}
                        className="w-5 h-5 cursor-pointer rounded-full text-xs leading-none hover:shadow-lg"
                        onClick={() => {
                            setEdges((edges) => edges.filter((edge) => edge.id !== props.id))
                        }}
                    >
                        <MinusIcon className="w-5 h-5" />
                    </Button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default DeletableEdge;
