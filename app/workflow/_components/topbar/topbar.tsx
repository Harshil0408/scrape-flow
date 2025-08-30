"use client"

import TooltipWrapper from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation"
import SaveBtn from "./save-button";
import ExecuteButton from "./execute-button";

interface Props {
    title: string;
    subtitle?: string;
    workflowId: string;
    hideButtons?: boolean;
}

const Topbar = ({ title, subtitle, workflowId, hideButtons = false }: Props) => {

    const router = useRouter();

    return (
        <header className="flex p-2 border-b-2 border-separate justify-between w-full h-[60px] sticky top-0 bg-background z-10">
            <div className="flex gap-1 flex-1">
                <TooltipWrapper content="Back">
                    <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => router.back()}
                    >
                        <ChevronLeftIcon size={20} />
                    </Button>
                </TooltipWrapper>
                <div>
                    <p className="font-bold text-ellipsis truncate">{title}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground truncate text-ellipsis">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="flex gap-1 flex-1 justify-end">
                    {hideButtons === false && (
                        <>
                            <ExecuteButton workflowId={workflowId} />
                            <SaveBtn workflowId={workflowId} />
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Topbar
