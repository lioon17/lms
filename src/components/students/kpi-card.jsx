import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Trophy, Clock, Flame } from "lucide-react"

export function KPICards() {
  const kpis = [
    {
      title: "Courses in Progress",
      value: "4",
      icon: BookOpen,
      color: "text-chart-1",
    },
    {
      title: "Certificates Earned",
      value: "12",
      icon: Trophy,
      color: "text-chart-2",
    },
    {
      title: "Quizzes Due",
      value: "3",
      icon: Clock,
      color: "text-chart-4",
    },
    {
      title: "Learning Streak",
      value: "15 days",
      icon: Flame,
      color: "text-chart-5",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-balance">{kpi.value}</p>
              </div>
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
