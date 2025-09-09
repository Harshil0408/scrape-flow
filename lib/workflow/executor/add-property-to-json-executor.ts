import { ExecutionEnvironment } from "@/types/executor";
import { AddPropertyToJsonTask } from "../task/add-property-to-json";

export async function AddPropertyToJsonExecutor(environment: ExecutionEnvironment<typeof AddPropertyToJsonTask>): Promise<boolean> {
    try {

        const jsonData = environment.getInput("JSON");
        if (!jsonData) {
            environment.log.error("input->json not found")
        }
        const propertyName = environment.getInput("Property name");
        if (!propertyName) {
            environment.log.error("input->propertyName not found")
        }
        const propertyValue = environment.getInput("Property value");
        if (!propertyValue) {
            environment.log.error("input->propertyValue not found")
        }

        const json = JSON.parse(jsonData);
        json[propertyName] = propertyValue;
        environment.setOutput("Update JSON", JSON.stringify(json));
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}
