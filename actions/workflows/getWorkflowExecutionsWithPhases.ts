"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getWorkflowExecutionWithPhases(executionId: string) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthorized")
    }

    return prisma.workflowExecution.findUnique({
        where: {
            id: executionId,
            userId,
        },
        include: {
            phases: {
                orderBy: {
                    number: "asc"
                }
            }
        }
    });
}

