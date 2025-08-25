"use client"

import { Workflow } from "@prisma/client"
import { ReactFlowProvider } from '@xyflow/react'
import FlowEditor from "./flow-editor"
import Topbar from "./topbar/topbar"

const Editor = ({ workflow }: { workflow: Workflow }) => {
    return (
        <ReactFlowProvider>
            <div className="flex flex-col h-full overflow-hidden">
                <Topbar workflowId={workflow.id} title="Workflow Editor" subtitle={workflow.name} />
                <section className="flex h-full overflow-auto">
                    <FlowEditor workflow={workflow} />
                </section>
            </div>
        </ReactFlowProvider>
    )
}

export default Editor
