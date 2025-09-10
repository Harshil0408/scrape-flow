import { GetPeriods } from '@/actions/analytics/getPeriods'
import { GetStatsCardValues } from '@/actions/analytics/getStatsCardValues'
import { Skeleton } from '@/components/ui/skeleton'
import { Period } from '@/types/analytics'
import { Suspense } from 'react'
import PeriodSelector from './_components/period-selector'
import StatsCard from './_components/stats-card'
import { CirclePlayIcon, CoinsIcon, WaypointsIcon } from 'lucide-react'
import { GetWorkflowExecutionsStats } from '@/actions/analytics/getWorkflowExecutionStats'
import ExecutionStatusChart from './_components/execution-status-chart'
import { GetCreditsUsageInPeriod } from '@/actions/analytics/getCreditsUsageInPeriod'
import CreditsUsageChart from '../billing/_components/execution-status-chart'

export default async function HomePage({ searchParams }: { searchParams: { month?: string; year?: string } }) {
    const currentDate = new Date()
    const { month, year } = searchParams

    const period: Period = {
        month: month ? parseInt(month) : currentDate.getMonth(),
        year: year ? parseInt(year) : currentDate.getFullYear(),
    }

    return (
        <div className="flex flex-1 flex-col h-full">
            <div className="flex justify-between">
                <h1 className="text-3xl font-bold">Home</h1>
                <Suspense fallback={<Skeleton className="w-[180px] h-[40px]" />}>
                    <PeriodSelectWrapper selectedPeriod={period} />
                </Suspense>
            </div>
            <div className='h-full py-6 flex flex-col'>
                <Suspense fallback={<StatsCardSkeleton />}>
                    <StatsCards selectedPeriod={period} />
                </Suspense>
                <Suspense fallback={<Skeleton className='w-full h-[300px]' />}>
                    <StatsExecutionStatus selectedPeriod={period} />
                </Suspense>
                <Suspense fallback={<Skeleton className='w-full h-[300px]' />}>
                    <CreditsUsageInPeriod selectedPeriod={period} />
                </Suspense>
            </div>
        </div>
    )
}

async function PeriodSelectWrapper({ selectedPeriod }: { selectedPeriod: Period }) {
    const periods = await GetPeriods()
    return <PeriodSelector selectedPeriod={selectedPeriod} periods={periods} />
}

async function StatsCards({ selectedPeriod }: { selectedPeriod: Period }) {
    const data = await GetStatsCardValues(selectedPeriod)

    return (
        <div className='grid gap-3 lg:gap-8 lg:grid-cols-3 min-h-[120px]'>
            <StatsCard
                title="Workflow executions"
                value={data.workflowExecutions}
                icon="CirclePlay"
            />
            <StatsCard
                title="Phase executions"
                value={data.phaseExecution}
                icon="Waypoints"
            />
            <StatsCard
                title="Credits consumed"
                value={data.creditsConsumed}
                icon="Coins"
            />
        </div>
    )
}

function StatsCardSkeleton() {
    return (
        <div className='grid gap-3 lg:gap-8 lg:grid-cols-3'>
            {
                [1, 2, 3].map(i => <Skeleton key={i} className='w-full min-h-[120px] ' />)
            }
        </div>
    )
}


async function StatsExecutionStatus({ selectedPeriod }: { selectedPeriod: Period }) {
    const data = await GetWorkflowExecutionsStats(selectedPeriod);

    return (
        <ExecutionStatusChart data={data} />
    )
}

async function CreditsUsageInPeriod({ selectedPeriod }: { selectedPeriod: Period }) {
    const data = await GetCreditsUsageInPeriod(selectedPeriod);

    return (
        <CreditsUsageChart
            data={data}
            title="Daily credits spent"
            description="Daily credits consumed in selected period"
        />
    )
}
