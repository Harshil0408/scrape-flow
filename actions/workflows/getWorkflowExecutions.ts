"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GetWorkflowExecutions(workflowId: string) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthorized")
    }

    return prisma.workflowExecution.findMany({
        where: {
            userId,
            workflowId
        },
        orderBy: {
            createdAt: "desc"
        }
    })
}