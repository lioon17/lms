"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Trophy, Clock, Flame } from "lucide-react"
import { useSessionGuard } from "@/hooks/useSessionGuard"

export function KPICards() {
  const { authorized, userId } = useSessionGuard(null, false) // no redirect here
  const [activeCount, setActiveCount] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!authorized) return
        if (!userId) throw new Error("Missing user id")
        const res = await fetch(`/api/enrollments/active-count/${userId}`, { cache: "no-store" })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Failed to load active courses")
        if (alive) {
          setActiveCount(Number(json.active_count ?? 0))
          setError(null)
        }
      } catch (e) {
        if (alive) setError(e.message)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [authorized, userId])

  const kpis = [
    {
      title: "Courses in Progress",
      value: loading ? "…" : error ? "—" : String(activeCount ?? 0),
      icon: BookOpen,
      color: "text-chart-1",
    },
    { title: "Certificates Earned", value: "12", icon: Trophy, color: "text-chart-2" },
    { title: "Quizzes Due", value: "3", icon: Clock, color: "text-chart-4" },
    { title: "Learning Streak", value: "15 days", icon: Flame, color: "text-chart-5" },
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
