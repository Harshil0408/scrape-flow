"use client";

import { PublishWorkflow } from "@/actions/workflows/publishWorkflow";
import { RunWorkFlow } from "@/actions/workflows/runWorkflow";
import useExecutionPlan from "@/components/hooks/useExecutionPlan";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { PlayIcon, Upload } from "lucide-react";
import { toast } from "sonner";


function PublishButton({ workflowId }: { workflowId: string }) {

    const generate = useExecutionPlan();
    const { toObject } = useReactFlow();

    const mutation = useMutation({
        mutationFn: PublishWorkflow,
        onSuccess: () => {
            toast.success("Workflow Published", { id: workflowId })
        },
        onError: () => {
            toast.error("Something went wrong", { id: workflowId })
        }
    })

    return (
        <Button
            variant={"outline"}
            className="flex items-center gap-2"
            disabled={mutation.isPending}
            onClick={() => {
                const plan = generate();
                if (!plan) {
                    return;
                }
                toast.loading("Publishing Workflow...", { id: workflowId })
                mutation.mutate({
                    id: workflowId,
                    flowDefinition: JSON.stringify(toObject()),
                })
            }}
        >
            <Upload size={16} className="stroke-green-400" />
            Publish
        </Button>
    )
}

export default PublishButton
