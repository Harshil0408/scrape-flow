import { ExecutionEnvironment } from "@/types/executor";
import { NavigateUrlTask } from "../task/navigate-url";

export async function NavigateUrlExecutor(environment: ExecutionEnvironment<typeof NavigateUrlTask>): Promise<boolean> {
    try {

        const url = environment.getInput("URL");
        if (!url) {
            environment.log.error("input->url not found")
        }

        await environment.getPage()!.goto(url);
        environment.log.info(`Visited URL: ${url}`);

        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}
