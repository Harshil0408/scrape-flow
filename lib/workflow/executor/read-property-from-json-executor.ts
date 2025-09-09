import { ExecutionEnvironment } from "@/types/executor";
import { ReadPropertyFromJsonTask } from "../task/read-property-from-json";

export async function ReadPropertyFromJsonExecutor(environment: ExecutionEnvironment<typeof ReadPropertyFromJsonTask>): Promise<boolean> {
    try {

        const jsonData = environment.getInput("JSON");
        if (!jsonData) {
            environment.log.error("input->json not found")
        }
        const propertyName = environment.getInput("Property name");
        if (!propertyName) {
            environment.log.error("input->propertyName not found")
        }

        const json = JSON.parse(jsonData);
        const propertyValue = json[propertyName];
        if (!propertyValue) {
            environment.log.error("Property not found");
            return false;
        }
        environment.setOutput("Property value", propertyValue);
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}
