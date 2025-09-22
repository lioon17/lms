"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Play, Clock, Target } from "lucide-react"

export function CourseLearnPage({ course, onBack, onQuizStart }) {
  const [currentLesson, setCurrentLesson] = useState(0)

  const modules = [
    {
      id: 1,
      title: "Introduction to React",
      lessons: [
        { id: 1, title: "What is React?", completed: true, hasQuiz: false },
        { id: 2, title: "Setting up Development Environment", completed: true, hasQuiz: true, quizPassed: true },
        { id: 3, title: "Your First Component", completed: true, hasQuiz: true, quizPassed: true },
      ],
      finalQuiz: { id: "mod1-final", title: "Module 1 Final", completed: true, passed: true },
    },
    {
      id: 2,
      title: "Components and Props",
      lessons: [
        { id: 4, title: "Understanding Components", completed: true, hasQuiz: false },
        { id: 5, title: "Props and Data Flow", completed: true, hasQuiz: true, quizPassed: true },
        { id: 6, title: "Component Composition", completed: false, hasQuiz: true, quizPassed: false },
      ],
      finalQuiz: { id: "mod2-final", title: "Module 2 Final", completed: false, passed: false, locked: true },
    },
    {
      id: 3,
      title: "State and Lifecycle",
      lessons: [
        { id: 7, title: "Introduction to State", completed: false, hasQuiz: false },
        { id: 8, title: "useState Hook", completed: false, hasQuiz: true, quizPassed: false },
        { id: 9, title: "useEffect Hook", completed: false, hasQuiz: true, quizPassed: false },
      ],
      finalQuiz: { id: "mod3-final", title: "Module 3 Final", completed: false, passed: false, locked: true },
    },
  ]

  const currentLessonData = {
    title: "Component Composition",
    videoUrl: "/react-tutorial-video.jpg",
    content: `
      In this lesson, we'll explore how to compose components together to build complex UIs.
      Component composition is a powerful pattern in React that allows you to build reusable
      and maintainable components.
    `,
    resources: [
      { title: "React Documentation - Composition", url: "#" },
      { title: "Code Examples", url: "#" },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-balance">{course.title}</h1>
                <p className="text-sm text-muted-foreground">Module 2: Components and Props</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button variant="ghost" size="sm">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Syllabus Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg text-balance">Course Syllabus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <h4 className="font-medium text-sm text-balance">{module.title}</h4>
                    <div className="space-y-1 ml-2">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 text-sm p-1 rounded hover:bg-muted/50 cursor-pointer"
                        >
                          {lesson.completed ? (
                            <CheckCircle className="w-4 h-4 text-chart-1" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-muted rounded-full" />
                          )}
                          <span className={lesson.completed ? "text-foreground" : "text-muted-foreground"}>
                            {lesson.title}
                          </span>
                          {lesson.hasQuiz && (
                            <Clock
                              className={`w-3 h-3 ${lesson.quizPassed ? "text-chart-1" : "text-muted-foreground"}`}
                            />
                          )}
                        </div>
                      ))}

                      {/* Module Final Quiz */}
                      <div className="flex items-center gap-2 text-sm p-1 rounded hover:bg-muted/50 cursor-pointer mt-2 border-t pt-2">
                        {module.finalQuiz.locked ? (
                          <div className="w-4 h-4 border-2 border-muted rounded-full opacity-50" />
                        ) : module.finalQuiz.passed ? (
                          <CheckCircle className="w-4 h-4 text-chart-1" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-chart-4 rounded-full" />
                        )}
                        <span
                          className={`font-medium ${module.finalQuiz.locked ? "text-muted-foreground" : "text-chart-4"}`}
                        >
                          {module.finalQuiz.title}
                        </span>
                        <Target className="w-3 h-3 text-chart-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">{currentLessonData.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Player */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <img
                    src={currentLessonData.videoUrl || "/placeholder.svg"}
                    alt="Lesson video"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Lesson Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-pretty">{currentLessonData.content}</p>
                </div>

                {/* Resources */}
                <div className="space-y-2">
                  <h4 className="font-medium">Resources</h4>
                  <div className="space-y-1">
                    {currentLessonData.resources.map((resource, index) => (
                      <a key={index} href={resource.url} className="block text-sm text-primary hover:underline">
                        {resource.title}
                      </a>
                    ))}
                  </div>
                </div>

                <Button className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              </CardContent>
            </Card>

            {/* Lesson Quiz */}
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Lesson Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground text-pretty">
                    Test your understanding of component composition with this quick quiz.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>5 Questions</span>
                    <span>•</span>
                    <span>10 Minutes</span>
                    <span>•</span>
                    <span>2 Attempts Left</span>
                  </div>
                  <Button
                    onClick={() =>
                      onQuizStart({
                        id: "lesson-6-quiz",
                        title: "Component Composition Quiz",
                        type: "lesson-quiz",
                      })
                    }
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg text-balance">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lessons Completed</span>
                    <span>
                      {course.lessonsCompleted}/{course.totalLessons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quizzes Passed</span>
                    <span>
                      {course.quizzesPassed}/{course.totalQuizzes}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Threshold</span>
                    <span>70%</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 text-balance">Requirements</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Complete all lessons</li>
                    <li>• Pass all quizzes ≥ 70%</li>
                    <li>• Pass all module finals</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
