import { ExecutionEnvironment } from "@/types/executor";
import { FillInputTask } from "../task/fill-input";

export async function FillInputExecutor(environment: ExecutionEnvironment<typeof FillInputTask>): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        if (!selector) {
            environment.log.error("Input->selector is not defined")
        }

        const value = environment.getInput("Value");
        if (!selector) {
            environment.log.error("Input->value is not defined")
        }

        await environment.getPage()!.type(selector, value);

        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}
