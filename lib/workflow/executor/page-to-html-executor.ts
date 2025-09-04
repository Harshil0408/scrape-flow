import { ExecutionEnvironment } from "@/types/executor";
import { PageToHtmlTask } from "../task/page-to-html";

export async function PageToHtmlExecutor(environment: ExecutionEnvironment<typeof PageToHtmlTask>): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Web Page");
        console.log(websiteUrl);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
