"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Save, Eye, CopySlash as Publish } from "lucide-react"

import { CourseBasics } from "./course-basics"
import { CourseModules } from "./course-modules"
import { CourseLessons } from "./course-lessons"
import { CourseQuizzes } from "./course-quizzes"
import { CourseCertificate } from "./course-certificate"

export function CourseBuilderMain({
  course: initialCourse,
  onBack = () => {},           // ✅ safe default
  onSave = () => {},   
  instructors,
  categories,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  hideSidebar = false,
  hideHeader = false,
}) {
  const [course, setCourse] = useState(initialCourse)
  const [internalActiveTab, setInternalActiveTab] = useState("basics")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const activeTab = externalActiveTab || internalActiveTab
  const setActiveTab = externalOnTabChange || setInternalActiveTab

  const handleCourseUpdate = (updates) => {
    setCourse(updates)
    setHasUnsavedChanges(true)
  }

 const handleSave = () => {
    if (typeof onSave === "function") onSave(course)
    setHasUnsavedChanges(false)
  }

  const getTabStatus = (tabName) => {
    switch (tabName) {
      case "basics":
        return course.title && course.description ? "complete" : "incomplete"
      case "modules":
        return course.modules?.length > 0 ? "complete" : "incomplete"
      case "lessons":
        return course.lessons?.length > 0 ? "complete" : "incomplete"
      case "quizzes":
        return course.quizzes?.length > 0 ? "complete" : "incomplete"
      case "certificate":
        return course.certificateSettings?.enabled ? "complete" : "incomplete"
      default:
        return "incomplete"
    }
  }

  const getStatusBadge = (status) => {
    if (status === "complete") {
      return (
        <Badge variant="default" className="text-xs">
          ✓
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="text-xs">
        ○
      </Badge>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "basics":
        return (
          <CourseBasics
            course={course}
            onUpdate={handleCourseUpdate}
            onSave={handleSave}
            instructors={instructors}
            categories={categories}
          />
        )
      case "modules":
        return <CourseModules course={course} onUpdate={handleCourseUpdate} onSave={handleSave} />
      case "lessons":
        return <CourseLessons course={course} onUpdate={handleCourseUpdate} onSave={handleSave} />
      case "quizzes":
        return <CourseQuizzes course={course} onUpdate={handleCourseUpdate} onSave={handleSave} />
      case "certificate":
        return <CourseCertificate course={course} onUpdate={handleCourseUpdate} onSave={handleSave} />
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Course Settings</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Course settings panel coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )
      case "preview":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Course Preview</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Course preview functionality coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return <div>Content for {activeTab}</div>
    }
  }

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-background"}>
      {!hideHeader && (
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-xl font-bold">{course.title || "New Course"}</h1>
                  <p className="text-sm text-muted-foreground">Course Builder</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Unsaved Changes
                  </Badge>
                )}
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Course
                </Button>
                <Button variant="outline" size="sm">
                  <Publish className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hideSidebar ? (
        // When sidebar is hidden, render content directly
        <div className="w-full">{renderContent()}</div>
      ) : (
        // Original layout with sidebar
        <div className="flex-1 p-6">{renderContent()}</div>
      )}

      {/* Progress Indicator */}
      <div className="fixed bottom-4 right-4">
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="text-sm font-medium mb-2">Course Progress</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span>Basics</span>
                {getStatusBadge(getTabStatus("basics"))}
              </div>
              <div className="flex items-center justify-between">
                <span>Modules</span>
                {getStatusBadge(getTabStatus("modules"))}
              </div>
              <div className="flex items-center justify-between">
                <span>Lessons</span>
                {getStatusBadge(getTabStatus("lessons"))}
              </div>
              <div className="flex items-center justify-between">
                <span>Quizzes</span>
                {getStatusBadge(getTabStatus("quizzes"))}
              </div>
              <div className="flex items-center justify-between">
                <span>Certificate</span>
                {getStatusBadge(getTabStatus("certificate"))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
