import { ExecutionEnvironment } from "@/types/executor";
import { ExtractTextFromElementTask } from "../task/extract-text-from-element";
import * as cheerio from 'cheerio'

export async function ExtractTextFromElementExecutor(environment: ExecutionEnvironment<typeof ExtractTextFromElementTask>): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        if (!selector) {
            return false;
        }
        const html = environment.getInput("Html");
        if (!html) {
            return false;
        }

        const $ = cheerio.load(html)
        const element = $(selector);

        if (!element) {
            console.log("Element not found");
            return false;
        }

        const extractedText = $.text(element);
        if (!extractedText) {
            console.log("Element has no text");
            return false;
        }

        environment.setOutput("Extracted Text", extractedText)

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
