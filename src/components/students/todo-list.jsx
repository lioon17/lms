"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, AlertCircle } from "lucide-react"

export function TodoList({ onQuizStart }) {
  const todos = [
    {
      id: 1,
      type: "lesson",
      title: "React Hooks Deep Dive",
      course: "Advanced React Development",
      dueDate: null,
      isOverdue: false,
    },
    {
      id: 2,
      type: "lesson-quiz",
      title: "Component Lifecycle Quiz",
      course: "Advanced React Development",
      dueDate: "2024-01-15",
      isOverdue: false,
      attemptsLeft: 2,
    },
    {
      id: 3,
      type: "module-final",
      title: "Module 3 Final Assessment",
      course: "Machine Learning Basics",
      dueDate: "2024-01-12",
      isOverdue: true,
      cooldownEnds: "2024-01-14T10:30:00Z",
    },
  ]

  const getTypeIcon = (type) => {
    switch (type) {
      case "lesson":
        return <Play className="w-4 h-4" />
      case "lesson-quiz":
      case "module-final":
        return <Clock className="w-4 h-4" />
      default:
        return <Play className="w-4 h-4" />
    }
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case "lesson":
        return <Badge variant="outline">Lesson</Badge>
      case "lesson-quiz":
        return <Badge className="bg-chart-2 text-white">Quiz</Badge>
      case "module-final":
        return <Badge className="bg-chart-4 text-white">Final</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatCooldown = (cooldownEnds) => {
    const now = new Date()
    const end = new Date(cooldownEnds)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Available now"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Up Next</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getTypeIcon(todo.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-balance">{todo.title}</h4>
                    {getTypeBadge(todo.type)}
                    {todo.isOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{todo.course}</p>
                  {todo.cooldownEnds && (
                    <p className="text-xs text-muted-foreground">Retry in: {formatCooldown(todo.cooldownEnds)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {todo.attemptsLeft && (
                  <span className="text-xs text-muted-foreground">{todo.attemptsLeft} attempts left</span>
                )}
                <Button
                  size="sm"
                  disabled={todo.cooldownEnds && new Date(todo.cooldownEnds) > new Date()}
                  onClick={() => todo.type !== "lesson" && onQuizStart(todo)}
                >
                  {todo.type === "lesson" ? "Continue" : "Start"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
