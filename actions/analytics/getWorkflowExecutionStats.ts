"use server";

import { PeriodToDateRange } from "@/lib/helper/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { WorkflowExecutionStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { eachDayOfInterval, format } from "date-fns";

type Stats = Record<string, {
    success: number,
    failed: number
}>

export async function GetWorkflowExecutionsStats(period: Period) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthenticated")
    }

    const dateRange = PeriodToDateRange(period);
    const executions = await prisma.workflowExecution.findMany({
        where: {
            userId,
            startedAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
        },
    });

    const stats: Stats = eachDayOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate
    })
        .map(date => format(date, "yyyy-MM-dd"))
        .reduce((acc, date) => {
            acc[date] = {
                success: 0,
                failed: 0
            };
            return acc;
        }, {} as any);

    executions.forEach(execution => {
        const date = format(execution.startedAt!, "yyyy-MM-dd");
        if (stats[date]) {
            if (execution.status === "COMPLETED") {
                stats[date].success += 1;
            } else if (execution.status === "FAILED") {
                stats[date].failed += 1;
            }
        } else {
            console.warn("Date not found in stats:", date, execution.startedAt);
        }
    });

    const result = Object.entries(stats).map(([date, info]) => ({
        date,
        ...info,
    }))

    return result;

}