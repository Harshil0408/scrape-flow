"use client"

import { DeleteCredential } from "@/actions/credentials/deleteCredential";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    name: string;
}

const DeleteCredentialDialog = ({ name }: Props) => {

    const [open, setOpen] = useState<boolean>(false);
    const [confirmText, setConfirmText] = useState<string>('');

    const deleteMutation = useMutation({
        mutationFn: DeleteCredential,
        onSuccess: () => {
            toast.success("Credential deleted successfully", { id: name });
            setConfirmText("");
        },
        onError: () => {
            toast.error("Something went wrong", { id: name });
        }
    });

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant={"destructive"} size={"icon"}>
                    <XIcon size={18} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        If you delete this credential, you will not able to recover it.
                        <div className="flex flex-col py-4 gap-2">
                            <p>
                                If you are sure, enter <b>{name}</b> to confirm:
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
                            toast.loading("Deleting credential...", { id: name });
                            deleteMutation.mutate(name);
                        }}
                        disabled={name !== confirmText || deleteMutation.isPending || confirmText.length === 0}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteCredentialDialog
