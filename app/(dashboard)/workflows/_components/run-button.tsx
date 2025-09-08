"use client";

import { RunWorkFlow } from "@/actions/workflows/runWorkflow";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { PlayIcon } from "lucide-react";
import { toast } from "sonner";


const RunButton = ({ workflowId }: { workflowId: string }) => {

    const mutation = useMutation({
        mutationFn: RunWorkFlow,
        onSuccess: () => {
            toast.success("Workflow started", { id: workflowId })
        },
        onError: () => {
            toast.error("Something went wrong", { id: workflowId })
        }
    })

    return (
        <Button
            className="flex items-center gap-2"
            variant={"outline"}
            size={"sm"}
            onClick={() => {
                toast.loading("Scheduling run...", { id: workflowId });
                mutation.mutate({
                    workflowId
                })
            }}
        >
            <PlayIcon size={16} /> Run
        </Button>
    )
}

export default RunButton
