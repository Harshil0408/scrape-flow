import { TaskType } from "@/types/task";
import { LaunchBrowserExecutor } from "./launch-browser-executor";
import { PageToHtmlExecutor } from "./page-to-html-executor";
import { ExecutionEnvironment } from "@/types/executor";
import { WorkflowTask } from "@/types/workflow";

type ExecutorFn<T extends WorkflowTask> = (environment: ExecutionEnvironment<T>) => Promise<boolean>;

type RegisterType = {
  [k in TaskType]: ExecutorFn<WorkflowTask & { type: k }>;
}

export const ExecutorRegistry: RegisterType = {
  LAUNCH_BROWSER: LaunchBrowserExecutor,
  PAGE_TO_HTML: PageToHtmlExecutor,
  EXTRACT_TEXT_FROM_ELEMENT: () => Promise.resolve(true),
};
