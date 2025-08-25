"use client"

import { DeleteWorkflow } from "@/actions/workflows/deleteWorkflow";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    open: boolean
    setOpen: (open: boolean) => void;
    workflowName: string;
    workflowId: string;
}

const DeleteWorkflowDialog = ({ open, setOpen, workflowName, workflowId }: Props) => {

    const [confirmText, setConfirmText] = useState('');

    const deleteMutation = useMutation({
        mutationFn: DeleteWorkflow,
        onSuccess: () => {
            toast.success("Workflow deleted successfully", { id: workflowId });
            setConfirmText("");
        },
        onError: () => {
            toast.error("Something went wrong", { id: workflowId });
        }
    });

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        If you delete this workflow, you will not able to recover it.
                        <div className="flex flex-col py-4 gap-2">
                            <p>
                                If you are sure, enter <b>{workflowName}</b> to confirm:
                            </p>
                            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                            toast.loading("Deleting workflow...", { id: workflowId });
                            deleteMutation.mutate(workflowId);
                        }}
                        disabled={workflowName !== confirmText || deleteMutation.isPending}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteWorkflowDialog
