"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Bell, User, Settings } from "lucide-react"
import { KPICards } from "@/components/students/kpi-card"
import { CourseGrid } from "@/components/students/course-grid"
import { TodoList } from "@/components/students/todo-list"
import { CertificatesSection } from "@/components/students/certificates-section"
import { NotificationsPanel } from "@/components/students/notifications-panel"
import { CourseLearnPage } from "@/components/students/course-learn-page"
import { QuizInterface } from "@/components/students/quiz-interface"

export default function StudentDashboard() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const handleCourseSelect = (course) => {
    setSelectedCourse(course)
    setCurrentView("course")
  }

  const handleQuizStart = (quiz) => {
    setSelectedQuiz(quiz)
    setCurrentView("quiz")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedCourse(null)
    setSelectedQuiz(null)
  }

  if (currentView === "course" && selectedCourse) {
    return <CourseLearnPage course={selectedCourse} onBack={handleBackToDashboard} onQuizStart={handleQuizStart} />
  }

  if (currentView === "quiz" && selectedQuiz) {
    return <QuizInterface quiz={selectedQuiz} onBack={handleBackToDashboard} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-balance">Student Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, Alex!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Strip */}
        <KPICards />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Courses */}
          <div className="lg:col-span-2 space-y-6">
            <CourseGrid onCourseSelect={handleCourseSelect} />
            <TodoList onQuizStart={handleQuizStart} />
          </div>

          {/* Right Column - Certificates & Notifications */}
          <div className="space-y-6">
            <CertificatesSection />
            <NotificationsPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
