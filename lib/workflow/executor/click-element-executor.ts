import { ExecutionEnvironment } from "@/types/executor";
import { ClickElementTask } from "../task/click-element";

export async function ClickElementExecutor(environment: ExecutionEnvironment<typeof ClickElementTask>): Promise<boolean> {
    try {

        const selector = environment.getInput("Selector");
        if (!selector) {
            environment.log.error("input->selector not found")
        }

        await environment.getPage()!.click(selector);

        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}
