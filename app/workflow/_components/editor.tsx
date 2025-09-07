"use client"

import { Workflow } from "@prisma/client"
import { ReactFlowProvider } from '@xyflow/react'
import FlowEditor from "./flow-editor"
import Topbar from "./topbar/topbar"
import TaskMenu from "./task-menu"
import { FlowValidationContextProvider } from "@/components/context/flow-validation-context"
import { WorkflowStatus } from "@/types/workflow"

const Editor = ({ workflow }: { workflow: Workflow }) => {
    return (
        <FlowValidationContextProvider>
            <ReactFlowProvider>
                <div className="flex flex-col h-full overflow-hidden">
                    <Topbar
                        workflowId={workflow.id}
                        title="Workflow Editor"
                        subtitle={workflow.name}
                        isPublished={workflow.status === WorkflowStatus.PUBLISHED}
                    />
                    <section className="flex h-full overflow-auto">
                        <TaskMenu />
                        <FlowEditor workflow={workflow} />
                    </section>
                </div>
            </ReactFlowProvider>
        </FlowValidationContextProvider>
    )
}

export default Editor
