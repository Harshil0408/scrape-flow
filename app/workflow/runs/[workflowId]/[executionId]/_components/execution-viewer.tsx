"use client";

import { getWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionsWithPhases";
import { GetWorkflowPhaseWithDetails } from "@/actions/workflows/getWorkflowPhaseDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateToDurationString } from "@/lib/helper/dates";
import { GetPhasesTotalCost } from "@/lib/helper/phases";
import { cn } from "@/lib/utils";
import { LogLevel } from "@/types/log";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/types/workflow";
import { ExecutionLog } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, CircleDashedIcon, ClockIcon, CoinsIcon, Loader2, LucideIcon, WorkflowIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import PhaseStatusBadge from "./phase-status-badge";
import ReactCountWrapper from "@/components/react-counter-wrapper";

type ExecutionData = Awaited<ReturnType<typeof getWorkflowExecutionWithPhases>>;

const ExecutionViewer = ({
    initialData
}: {
    initialData: ExecutionData;
}) => {

    const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

    const query = useQuery({
        queryKey: ["execution", initialData?.id],
        initialData,
        queryFn: () => getWorkflowExecutionWithPhases(initialData!.id),
        refetchInterval: (q) =>
            q.state.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false
    });

    const phaseDetails = useQuery({
        queryKey: ["phaseDetails", selectedPhase],
        enabled: selectedPhase !== null,
        queryFn: () => GetWorkflowPhaseWithDetails(selectedPhase!)
    })

    const isRunning = query.data?.status === WorkflowExecutionStatus.RUNNING;

    useEffect(() => {
        const phases = query.data?.phases || [];
        if (isRunning) {
            const phaseToSelect = phases.toSorted((a, b) => a.startedAt! > b.startedAt! ? -1 : 1)[0];
            setSelectedPhase(phaseToSelect.id);
            return;
        }

        const phaseToSelect = phases.toSorted((a, b) => a.completedAt! > b.completedAt! ? -1 : 1)[0];
        setSelectedPhase(phaseToSelect.id);

    }, [query.data?.phases, isRunning, setSelectedPhase])

    const duration = DateToDurationString(query.data?.completedAt, query.data?.startedAt);

    const creditsConsumed = GetPhasesTotalCost(query.data?.phases || []);

    return (
        <div className="flex w-full h-full">
            <aside className="w-[440px] min-w-[440px] max-w-[400px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden">
                <div className="py-4 px-2">
                    {/* Status label */}
                    <ExecutionLabel
                        icon={CircleDashedIcon}
                        label="Status"
                        value={query.data?.status}
                    />
                    <ExecutionLabel
                        icon={CalendarIcon}
                        label="Started At"
                        value={
                            <span className="lowercase">
                                {query.data?.startedAt ? formatDistanceToNow(new Date(query.data.startedAt), {
                                    addSuffix: true
                                }) : "-"}
                            </span>
                        }
                    />
                    <ExecutionLabel
                        icon={ClockIcon}
                        label="Duration"
                        value={duration ? duration : <Loader2 className="animate-spin" size={20} />}
                    />
                    <ExecutionLabel
                        icon={CoinsIcon}
                        label="Credits Consumed"
                        value={<ReactCountWrapper value={creditsConsumed} />}
                    />
                </div>
                <Separator />
                <div className="flex justify-center items-center py-2 px-4">
                    <div className="text-muted-foreground flex items-center gap-2">
                        <WorkflowIcon size={20} className="stroke-muted-foreground/80" />
                        <span className="font-semibold">
                            Phases
                        </span>
                    </div>
                </div>
                <Separator />
                <div className="overflow-auto h-full px-2 py-4">
                    {query.data?.phases.map((phase, index) => (
                        <Button
                            key={phase.id}
                            className="w-full justify-between"
                            variant={selectedPhase === phase.id ? "secondary" : "ghost"}
                            onClick={() => {
                                if (isRunning) return;
                                setSelectedPhase(phase.id)
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Badge variant={"outline"}>{index + 1}</Badge>
                                <p className="font-semibold">{phase.name}</p>
                            </div>
                            <PhaseStatusBadge status={phase.status as ExecutionPhaseStatus} />
                        </Button>
                    ))}
                </div>
            </aside>
            <div className="flex w-full h-full">
                {isRunning && (
                    <div className="flex items-center flex-col gap-2 justify-center h-full w-full">
                        <p className="font-bold">Run is in progress, please wait</p>
                    </div>
                )}
                {!isRunning && !selectedPhase && (
                    <div className="flex items-center flex-col gap-2 justify-center h-full w-full">
                        <div className="flex flex-col gap-1 text-center">
                            <p className="font-bold">No Phase Selected</p>
                            <p className="text-sm text-muted-foreground">Select a phase to view details</p>
                        </div>
                    </div>
                )}
                {!isRunning && selectedPhase && phaseDetails.data && (
                    <div className="flex flex-col py-4 container gap-4 overflow-auto">
                        <div className="flex gap-2 items-center">
                            <Badge variant={"outline"} className="space-x-4">
                                <div className="flex gap-1 items-center">
                                    <CoinsIcon className="stroke-muted-foreground" />
                                    <span>Credits</span>
                                </div>
                                <span>{phaseDetails.data.creditsConsumed}</span>
                            </Badge>
                            <Badge variant={"outline"} className="space-x-4">
                                <div className="flex gap-1 items-center">
                                    <ClockIcon className="stroke-muted-foreground" />
                                    <span>Duration</span>
                                </div>
                                <span>{DateToDurationString(phaseDetails.data.completedAt, phaseDetails.data.startedAt) || "-"}</span>
                            </Badge>
                        </div>
                        <ParameterViewer
                            title="Inputs"
                            subTitle="Inputs used for this phase"
                            paramsJson={phaseDetails.data.inputs}
                        />
                        <ParameterViewer
                            title="Outputs"
                            subTitle="Outputs used for this phase"
                            paramsJson={phaseDetails.data.outputs}
                        />
                        <LogViewer
                            logs={phaseDetails.data.logs}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default ExecutionViewer

function ExecutionLabel({ icon, label, value }: { icon: LucideIcon, label: ReactNode, value: ReactNode }) {

    const Icon = icon;

    return (
        <div className="flex justify-between items-center py-2 px-4 text-sm">
            <div className="text-muted-foreground flex items-center gap-2">
                <Icon size={20} className="stroke-muted-foreground/80" />
                <span>{label}</span>
            </div>
            <div className="font-semibold capitalize gap-2 items-center">
                {value}
            </div>
        </div>
    )
}

function ParameterViewer({ title, subTitle, paramsJson }: {
    title: string;
    subTitle: string;
    paramsJson: string | null
}) {

    const params = paramsJson ? JSON.parse(paramsJson) : undefined;

    return (
        <Card >
            <CardHeader className="rounded-lg rounded-b-none border-b py-4  bg-gray-50 dark:bg-background">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                    {subTitle}
                </CardDescription>
            </CardHeader>
            <CardContent className="py-4">
                <div className="flex flex-col gap-2">
                    {(!params || Object.keys(params).length === 0) && (
                        <p className="text-sm">No parameters generated by this phase</p>
                    )}
                    {params &&
                        Object.entries(params).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center space-y-1">
                                <p className="text-sm text-muted-foreground flex-1 basis-1/3">
                                    {key + " :"}
                                </p>
                                <Input
                                    readOnly
                                    className="flex-1 basis-2/3"
                                    value={value as string}
                                />
                            </div>
                        ))
                    }
                </div>
            </CardContent>
        </Card>
    )
}

function LogViewer({ logs }: { logs: ExecutionLog[] | undefined }) {
    if (!logs || logs.length === 0) return null;

    return (
        <Card className="w-full">
            <CardHeader className="rounded-lg rounded-b-none border-b py-4  bg-gray-50 dark:bg-background">
                <CardTitle className="text-base">Logs</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                    Logs generated by this phase
                </CardDescription>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="text-muted-foreground text-sm">
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Message</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id} className="text-muted-foreground">
                                    <TableCell width={190} className="text-xs text-muted-foreground p-[2px] pl-4">{log.timestamp.toISOString()}</TableCell>
                                    <TableCell width={80}
                                        className={cn("uppercase text-xs font-bold p-[3px] pl-4",
                                            (log.logLevel as LogLevel) === "error" &&
                                            "text-destructive",
                                            (log.logLevel as LogLevel) === "info" && "text-primary"
                                        )}
                                    >{log.logLevel}</TableCell>
                                    <TableCell className="text-sm flex-1 p-[1px] pl-4">{log.message}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </CardHeader>
        </Card>
    )
}