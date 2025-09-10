"use server";

import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { auth } from "@clerk/nextjs/server";

export async function GetPeriods() {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthenticated")
    }

    const years = await prisma.workflowExecution.aggregate({
        where: { userId },
        _min: { startedAt: true }
    });


    const currentYear = new Date().getFullYear();

    const minYear = years._min.startedAt ? years._min.startedAt.getFullYear() : currentYear;

    const periods: Period[] = [];

    for (let year = minYear; year <= currentYear; year++) {
        const lastMonth = year === currentYear ? new Date().getMonth() : 11;
        for (let month = 0; month <= lastMonth; month++) {
            periods.push({ year, month });
        }
    }

    return periods;
}