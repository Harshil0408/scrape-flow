import "server-only";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

export async function ExecuteWorkFlow(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
        where: {
            id: executionId,
        },
        include: {
            workflow: true,
            phases: true
        }
    })

    if (!execution) {
        throw new Error("Execution not found");
    }

    for (const phase of execution.phases) {

    }

    revalidatePath("/workflow/runs")

}