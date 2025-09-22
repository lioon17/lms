"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, FileText, Layers, HelpCircle, Settings, Award, Eye, ArrowLeft } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Import your existing course builder components
import { CourseBuilderMain } from "./course-builder-main"

export function CourseBuilderWithSidebar({ course, onSave, instructors, categories, backTo = "/admin" }) {
  const [activeTab, setActiveTab] = useState("basics")
  const router = useRouter()

  const handleBack = () => {
    router.push(backTo)
  }

  const getTabStatus = (tabName) => {
    switch (tabName) {
      case "basics":
        return course?.title && course?.description ? "complete" : "incomplete"
      case "modules":
        return course?.modules?.length > 0 ? "complete" : "incomplete"
      case "lessons":
        return course?.lessons?.length > 0 ? "complete" : "incomplete"
      case "quizzes":
        return course?.quizzes?.length > 0 ? "complete" : "incomplete"
      case "settings":
        return course?.settings ? "complete" : "incomplete"
      case "certificate":
        return course?.certificateSettings?.enabled ? "complete" : "incomplete"
      case "preview":
        return "incomplete"
      default:
        return "incomplete"
    }
  }

  const sidebarItems = [
    {
      id: "basics",
      label: "Basics",
      icon: FileText,
      status: getTabStatus("basics"),
    },
    {
      id: "modules",
      label: "Modules",
      icon: Layers,
      status: getTabStatus("modules"),
    },
    {
      id: "lessons",
      label: "Lessons",
      icon: BookOpen,
      status: getTabStatus("lessons"),
    },
    {
      id: "quizzes",
      label: "Quizzes",
      icon: HelpCircle,
      status: getTabStatus("quizzes"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      status: getTabStatus("settings"),
    },
    {
      id: "certificate",
      label: "Certificate",
      icon: Award,
      status: getTabStatus("certificate"),
    },
    {
      id: "preview",
      label: "Preview",
      icon: Eye,
      status: getTabStatus("preview"),
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="font-semibold">{course?.title || "New Course"}</h2>
                <p className="text-xs text-muted-foreground">Course Builder</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={activeTab === item.id} onClick={() => setActiveTab(item.id)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    <SidebarMenuBadge>
                      {item.status === "complete" ? (
                        <Badge variant="default" className="text-xs">
                          ✓
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          ○
                        </Badge>
                      )}
                    </SidebarMenuBadge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold capitalize">{activeTab}</h1>
            </div>
          </header>

          <main className="flex-1">
            <CourseBuilderMain
              course={course}
              onSave={onSave}
              instructors={instructors}
              categories={categories}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
