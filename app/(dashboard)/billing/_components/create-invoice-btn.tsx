"use client";

import { DownloadInvoice } from '@/actions/billing/donwloadInvoice';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

const InvoiceBtn = ({ id }: { id: string }) => {
    const mutation = useMutation({
        mutationFn: DownloadInvoice,
        onSuccess: (data) => {
            window.open(data as string, "_blank");
        },
        onError: () => {
            toast.error("Something went wrong");
        }
    })
    return (
        <Button
            variant={"outline"}
            size={"sm"}
            className='text-xs gap-2 text-muted-foreground px-1 my-2'
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(id)}
        >
            Generate Invoice
            {mutation.isPending && <Loader2 className='animate-spin h-4 w-4' />}
        </Button>
    )
}

export default InvoiceBtn
