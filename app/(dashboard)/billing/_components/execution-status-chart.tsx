"use client";

import { GetCreditsUsageInPeriod } from "@/actions/analytics/getCreditsUsageInPeriod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartColumnStackedIcon, Layers2 } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

type ChartData = Awaited<ReturnType<typeof GetCreditsUsageInPeriod>>

const chartConfig = {
    success: {
        label: "Successful phase credits",
        color: "hsl(var(--chart-2))"
    },
    failed: {
        label: "Failed phase credits",
        color: "hsl(var(--chart-1))"
    },
}

const CreditsUsageChart = ({ data, title, description }: { data: ChartData, title: string; description: string }) => {
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <ChartColumnStackedIcon className="w-6 h-6 text-primary" />
                    {title}
                </CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    className="max-h-[200px] w-full"
                    config={chartConfig}
                >
                    <BarChart
                        data={data}
                        height={200}
                        accessibilityLayer
                        margin={{ top: 20 }}
                    >
                        <CartesianGrid
                            vertical={false}
                        />
                        <XAxis
                            dataKey={"date"}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric"
                                })
                            }}
                        />
                        <ChartLegend
                            content={<ChartLegendContent />}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent className="w-[250px]" />}
                        />
                        <Bar
                            dataKey={"success"}
                            fill="var(--color-success)"
                            radius={[0, 0, 4, 4]}
                            fillOpacity={0.8}
                            stroke="var(--color-success)"
                            stackId={"a"}
                        />
                        <Bar
                            dataKey={"failed"}
                            fill="var(--color-failed)"
                            radius={[4, 4, 0, 0]}
                            fillOpacity={0.8}
                            stroke="var(--color-failed)"
                            stackId={"a"}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default CreditsUsageChart
