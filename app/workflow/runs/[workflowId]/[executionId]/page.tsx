import { getWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionsWithPhases";
import Topbar from "@/app/workflow/_components/topbar/topbar";
import { auth } from "@clerk/nextjs/server";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import ExecutionViewer from "./_components/execution-viewer";

export default function ExecutionViewerPage({
    params
}: {
    params: {
        executionId: string;
        workflowId: string;
    }
}) {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <Topbar
                workflowId={params.workflowId}
                title="Workflow run details"
                subtitle={`Run ID: ${params.executionId} `}
                hideButtons
            />
            <section className="flex h-full overflow-auto">
                <Suspense fallback={
                    <div className="flex w-full items-center justify-center run">
                        <Loader2Icon className="h-10 w-10 animate-spin stroke-primary" />
                    </div>
                }>
                    <ExecutionViewerWrapper executionId={params.executionId} />
                </Suspense>
            </section>
        </div>
    )
}


async function ExecutionViewerWrapper({ executionId }: { executionId: string }) {

    const { userId } = auth();
    if (!userId) {
        return <div>Unauthorized</div>
    }

    const workflowExecution = await getWorkflowExecutionWithPhases(executionId);

    if (!workflowExecution) {
        return <div>Not Found</div>
    }

    return (
        <ExecutionViewer initialData={workflowExecution} />
    )
}