"use client";

import { UnpublishWorkflow } from "@/actions/workflows/unpublishWorkflow";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { DownloadIcon, PlayIcon, Upload } from "lucide-react";
import { toast } from "sonner";


function UnpublishButton({ workflowId }: { workflowId: string }) {

    const mutation = useMutation({
        mutationFn: UnpublishWorkflow,
        onSuccess: () => {
            toast.success("Workflow Unpublished", { id: workflowId })
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
                toast.loading("Unpublishing Workflow...", { id: workflowId })
                mutation.mutate(workflowId)
            }}
        >
            <DownloadIcon size={16} className="stroke-orange-500" />
            Unpublish
        </Button>
    )
}

export default UnpublishButton
