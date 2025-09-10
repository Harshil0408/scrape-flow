"use client"

import ReactCountWrapper from "@/components/react-counter-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CirclePlayIcon,
  CoinsIcon,
  WaypointsIcon,
  type LucideIcon,
} from "lucide-react"

const icons: Record<string, LucideIcon> = {
  CirclePlay: CirclePlayIcon,
  Coins: CoinsIcon,
  Waypoints: WaypointsIcon,
}

interface Props {
  title: string
  value: number
  icon: keyof typeof icons
}

const StatsCard = ({ title, value, icon }: Props) => {
  const Icon = icons[icon]

  return (
    <Card className="relative overflow-hidden h-full">
      <CardHeader className="flex pb-2">
        <CardTitle>{title}</CardTitle>
        <Icon
          size={120}
          className="text-muted-foreground absolute -bottom-4 -right-8 stroke-primary opacity-10"
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          <ReactCountWrapper value={value} />
        </div>
      </CardContent>
    </Card>
  )
}

export default StatsCard
