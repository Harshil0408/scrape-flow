"use server";

import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function UnpublishWorkflow(id: string) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthorized")
    }

    const workflow = await prisma.workflow.findUnique({
        where: {
            id,
            userId
        }
    })

    if (!workflow) {
        throw new Error("Workflow not found")
    }

    if (workflow.status !== WorkflowStatus.PUBLISHED) {
        throw new Error("Workflow is not published")
    }

    await prisma.workflow.update({
        where: {
            userId,
            id
        },
        data: {
            status: WorkflowStatus.DRAFT,
            executionPlan: null
        }
    });

    revalidatePath(`/workflow/editor/${id}`)

}