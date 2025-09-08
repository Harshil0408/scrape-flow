"use client"

import TooltipWrapper from '@/components/tooltip-wrapper'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { WorkflowExecutionStatus, WorkflowStatus } from '@/types/workflow'
import { Workflow } from '@prisma/client'
import { ChevronRightIcon, ClockIcon, CoinsIcon, CornerDownRightIcon, FileTextIcon, MoreVerticalIcon, MoveRightIcon, PlayIcon, ShuffleIcon, TrashIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import DeleteWorkflowDialog from './delete-workflow-dialog'
import RunButton from './run-button'
import SchedularDialog from './schedular-dialong'
import { Badge } from '@/components/ui/badge'
import ExecutionStatusIndicator, { ExecutionStatusLabel } from '@/app/workflow/runs/[workflowId]/_components/execution-status-indicator'
import { format, formatDistanceToNow } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import DuplicateWorkflowDialog from './duplicate-worklfow-dialog'

const statusColors = {
    [WorkflowStatus.DRAFT]: "bg-yellow-400 text-yellow-600 text-white",
    [WorkflowStatus.PUBLISHED]: "bg-primary"
}

const WorkflowCard = ({ workflow }: { workflow: Workflow }) => {

    const isDraft = workflow.status === WorkflowStatus.DRAFT;

    return (
        <Card className='border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30 group/card'>
            <CardContent className='p-4 flex items-center justify-between h-[100px]'>
                <div className='flex items-center justify-end space-x-3'>
                    <div className={cn("w-10 h-10 rounded-full flex items-center bg-red-500 justify-center", statusColors[workflow.status as WorkflowStatus])}>
                        {isDraft ? (
                            <FileTextIcon className='h-5 w-5' />
                        ) : (
                            <PlayIcon className='h-5 w-5 text-white' />
                        )}
                    </div>
                    <div >
                        <h3 className='text-base font-bold text-muted-foreground flex items-center'>
                            <TooltipWrapper content={workflow.description || "No description"}>
                                <Link
                                    href={`/workflow/editor/${workflow.id}`}
                                    className='flex items-center hover:underline'
                                >
                                    {workflow.name}
                                </Link>
                            </TooltipWrapper>
                            {isDraft && (
                                <span className='ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full'>
                                    Draft
                                </span>
                            )}
                            <DuplicateWorkflowDialog workflowId={workflow.id} />
                        </h3>
                        <SchedularSection
                            cron={workflow.cron}
                            workflowId={workflow.id}
                            isDraft={isDraft}
                            creditsCost={workflow.creditsCost} />
                    </div>
                </div>
                <div className='flex items-center space-x-2'>
                    {!isDraft && <RunButton workflowId={workflow.id} />}
                    <Link
                        href={`/workflow/editor/${workflow.id}`}
                        className={cn(buttonVariants({
                            variant: "outline",
                            size: "sm"
                        }),
                            "flex items-center gap-2"
                        )}
                    >
                        <ShuffleIcon size={16} />
                        Edit
                    </Link>
                    <WorkflowActions
                        workflowName={workflow.name}
                        workflowId={workflow.id}
                    />
                </div>
            </CardContent>
            <LastRunDetails workflow={workflow} />
        </Card>
    )
}


function WorkflowActions({ workflowName, workflowId }: { workflowName: string; workflowId: string; }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <TooltipWrapper content="More actions">
                            <div className="flex items-center justify-center w-full h-full">
                                <MoreVerticalIcon size={18} />
                            </div>
                        </TooltipWrapper>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive flex items-center gap-2"
                        onSelect={() => setShowDeleteDialog(true)}
                    >
                        <TrashIcon size={16} />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteWorkflowDialog
                workflowId={workflowId}
                workflowName={workflowName}
                open={showDeleteDialog}
                setOpen={setShowDeleteDialog}
            />
        </>
    )
}

function SchedularSection({
    isDraft,
    creditsCost,
    workflowId,
    cron
}: {

    isDraft: boolean,
    creditsCost: number,
    workflowId: string,
    cron: string | null
}) {
    if (isDraft) return null;
    return <div className='flex items-center gap-2'>
        <CornerDownRightIcon className='h-4 w-4 text-muted-foreground' />
        <SchedularDialog workflowId={workflowId} cron={cron} key={`${cron}-${workflowId}`} />
        <MoveRightIcon className='h-4 w-4 text-muted-foreground' />
        <TooltipWrapper content="Credit consumption for full run">
            <div className='flex items-center gap-3'>
                <Badge
                    variant={"outline"}
                    className='space-x-2 text-muted-foreground rounded-sm'
                >
                    <CoinsIcon className='h-4 w-4' />
                    <span className='text-sm'>{creditsCost}</span>
                </Badge>
            </div>
        </TooltipWrapper>
    </div>
}

function LastRunDetails({ workflow }: { workflow: Workflow }) {
    const isDraft = workflow.status === WorkflowStatus.DRAFT;
    if (isDraft) {
        return null;
    }
    const { lastRunAt, lastRunStatus, lastRunId, nextRunAt } = workflow;
    const formattedStartedAt = lastRunAt && formatDistanceToNow(lastRunAt, { addSuffix: true });
    const nextSchedule = nextRunAt && format(nextRunAt, "yyyy-MM-dd HH:mm");
    const nextScheduleUtc = nextRunAt && formatInTimeZone(nextRunAt, "UTC", "HH:mm")
    return (
        <div className='bg-primary/5 px-4 py-1 flex justify-between items-center text-muted-foreground'>
            <div className='flex items-center tex-sm gap-2'>
                {lastRunAt && (
                    <Link href={`/workflow/runs/${workflow.id}/${lastRunId}`} className='flex items-center text-sm gap-2 group'>
                        <span>Last run:</span>
                        <ExecutionStatusIndicator
                            status={lastRunStatus as WorkflowExecutionStatus}
                        />
                        <ExecutionStatusLabel
                            status={lastRunStatus as WorkflowExecutionStatus}
                        />
                        <span>{formattedStartedAt}</span>
                        <ChevronRightIcon size={14} className='-translate-x-[2px] group-hover:translate-x-0 transition' />
                    </Link>
                )}
                {!lastRunAt && <p>No runs yet</p>}
            </div>
            {nextRunAt &&
                <div className='flex items-center text-sm gap-2'>
                    <ClockIcon size={12} />
                    <span>Next run at:</span>
                    <span>{nextSchedule}</span>
                    <span className='text-xs'>({nextScheduleUtc} UTC)</span>
                </div>
            }
        </div>
    )
}

export default WorkflowCard
