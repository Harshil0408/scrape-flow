import { Log, LogCollector, LogFunction, LogLevel, LogLevels } from "@/types/log";

export function createLogCollector(): LogCollector {

    const logs: Log[] = [];
    const getAll = () => logs;

    const LogFunctions = {} as Record<LogLevel, LogFunction>;
    LogLevels.forEach(level => LogFunctions[level] = (message: string) => {
        logs.push({ message, level, timestamp: new Date() })
    })

    return {
        getAll,
        ...LogFunctions
    };
}