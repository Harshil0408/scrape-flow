import { waitFor } from "@/lib/helper/waitfor";
import { ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer";
import { LaunchBrowserTask } from "../task/launch-browser";

export async function LaunchBrowserExecutor(environment: ExecutionEnvironment<typeof LaunchBrowserTask>): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url");
        const browser = await puppeteer.launch({
            headless: false,
        });

        await waitFor(3000);
        await browser.close();

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
