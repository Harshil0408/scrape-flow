"use client"

import CustomDialogHeader from "@/components/custom-dialog-header";
import { z } from 'zod'
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Layers2Icon, Loader, ShieldEllipsis } from "lucide-react";
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form";
import { createWorkflowSchema, createWorkflowSchemaType } from "@/schema/workflow";
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { CreateWorkFlow } from "@/actions/workflows/createWorkflows";
import { toast } from "sonner";
import { createCredentialsSchema, createCredentialsSchemaType } from "@/schema/credentials";
import { CreateCredential } from "@/actions/credentials/CreateCredentialForUser";


const CreateCredentialsDialog = ({ triggerText }: { triggerText?: string }) => {

    const [open, setOpen] = useState(false);

    const form = useForm<createCredentialsSchemaType>({
        resolver: zodResolver(createCredentialsSchema),
        mode: "onChange",
    });

    const { mutate, isPending } = useMutation({
        mutationFn: CreateCredential,
        onSuccess: () => {
            toast.success("Credential created", { id: "create-Credential" });
            form.reset();
        },
        onError: () => {
            toast.error("Failed to create Credential", { id: "create-Credential" })
        }
    });

    const handleFormSubmit = useCallback((values: createCredentialsSchemaType) => {
        toast.loading("Creating Credential...", { id: "create-Credential" });
        mutate(values);
    }, [mutate]);

    const { name, value } = form.getValues();

    return (
        <Dialog open={open} onOpenChange={(open) => {
            setOpen(open);
        }}>
            <DialogTrigger asChild>
                <Button>{triggerText ?? "Create"}</Button>
            </DialogTrigger>
            <DialogContent className="px-0">
                <CustomDialogHeader
                    icon={ShieldEllipsis}
                    title='Create Credential'
                />
                <div className="p-6">
                    <Form {...form}>
                        <form className="space-y-8 w-full" onSubmit={form.handleSubmit(handleFormSubmit)}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex gap-1 items-center">
                                            Name
                                            <p className="text-xs text-primary">(required)</p>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter a unique an descriptive name for the credentials<br />
                                            This name will be user to identify the credentials
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex gap-1 items-center">
                                            Value
                                            <p className="text-xs text-primary">(required)</p>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea className="resize-none"  {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the value associated with this credential <br />
                                            This value will be securely encrypted and stored
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={!form.formState.isValid || isPending}>
                                {!isPending && "Proceed"}
                                {isPending && (<Loader className="animate-spin" />)}
                            </Button>
                        </form>
                    </Form>
                </div>

            </DialogContent>
        </Dialog>
    )
}

export default CreateCredentialsDialog
