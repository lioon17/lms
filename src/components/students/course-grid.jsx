"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, CheckCircle, RotateCcw } from "lucide-react"

export function CourseGrid({ onCourseSelect }) {
  const courses = [
    {
      id: 1,
      title: "Advanced React Development",
      category: "Web Development",
      progress: 75,
      status: "In Progress",
      lessonsCompleted: 18,
      totalLessons: 24,
      quizzesPassed: 5,
      totalQuizzes: 6,
      cover: "/react-development-course.png",
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      category: "Data Science",
      progress: 100,
      status: "Completed",
      lessonsCompleted: 20,
      totalLessons: 20,
      quizzesPassed: 8,
      totalQuizzes: 8,
      cover: "/data-science-course.png",
    },
    {
      id: 3,
      title: "Machine Learning Basics",
      category: "AI/ML",
      progress: 45,
      status: "In Progress",
      lessonsCompleted: 9,
      totalLessons: 20,
      quizzesPassed: 3,
      totalQuizzes: 7,
      cover: "/machine-learning-course.png",
    },
    {
      id: 4,
      title: "Digital Marketing Strategy",
      category: "Marketing",
      progress: 0,
      status: "Failed",
      lessonsCompleted: 5,
      totalLessons: 15,
      quizzesPassed: 0,
      totalQuizzes: 5,
      hasWaiver: true,
      cover: "/digital-marketing-course.png",
    },
  ]

  const getStatusBadge = (status, hasWaiver) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-chart-1 text-white">Completed</Badge>
      case "In Progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "Failed":
        return hasWaiver ? (
          <Badge className="bg-chart-5 text-white">Re-enroll Free</Badge>
        ) : (
          <Badge variant="destructive">Failed</Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getActionButton = (course) => {
    if (course.status === "Failed" && course.hasWaiver) {
      return (
        <Button size="sm" className="w-full bg-transparent" variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Re-enroll Free
        </Button>
      )
    }

    if (course.status === "Completed") {
      return (
        <Button size="sm" className="w-full bg-transparent" variant="outline">
          <CheckCircle className="w-4 h-4 mr-2" />
          Review
        </Button>
      )
    }

    return (
      <Button size="sm" className="w-full" onClick={() => onCourseSelect(course)}>
        <Play className="w-4 h-4 mr-2" />
        Resume
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">My Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={course.cover || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">{getStatusBadge(course.status, course.hasWaiver)}</div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-balance">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.category}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Lessons: {course.lessonsCompleted}/{course.totalLessons}
                  </span>
                  <span>
                    Quizzes: {course.quizzesPassed}/{course.totalQuizzes}
                  </span>
                </div>

                {getActionButton(course)}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
