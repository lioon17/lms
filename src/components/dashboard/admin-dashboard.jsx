"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { listCourses, createCourse } from "@/lib/api/courses"
import { listInstructors } from "@/lib/api/instructors"
import { listCategories } from "@/lib/api/categories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { BookOpen, Award, BarChart3, Eye, Upload, Save, Globe, Users, Home } from "lucide-react"
import { useSessionGuard } from "@/hooks/useSessionGuard"
import { LMSOverview } from "@/components/dashboard/lms-overview"
import { CoursesSection } from "@/components/dashboard/courses-section"
import { Sidebar } from "@/components/ui/sidebar"
   // ✅

 export function AdminDashboard({ disableInternalSidebar = false, activeView, user: userProp }) {
  const { user: authUser, logout } = useAuth()
  const [courses, setCourses] = useState([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [showAdvancedCreator, setShowAdvancedCreator] = useState(false)
  const [currentCourseBuilder, setCurrentCourseBuilder] = useState(null)
  const { authorized, role, name } = useSessionGuard("admin")

  const [instructors, setInstructors] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingLists, setLoadingLists] = useState(true)
  const [showRestoredNotification, setShowRestoredNotification] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // If wrapper provides a view, keep local tab in sync
  useEffect(() => {
    if (activeView && activeView !== activeTab) {
      setActiveTab(activeView)
    }
  }, [activeView])  // no deps on setActiveTab needed

  // Add this utility function at the top of your component
  const getSavedCourseData = () => {
    if (typeof window === "undefined") return null

    const savedData = localStorage.getItem("course_builder_basics")
    if (!savedData) return null

    try {
      return JSON.parse(savedData)
    } catch (error) {
      console.error("Error parsing saved course data:", error)
      return null
    }
  }

  useEffect(() => {
    const savedBasics = getSavedCourseData()
    if (savedBasics) {
      setBasics(savedBasics)
      setShowRestoredNotification(true)

      // Auto-hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowRestoredNotification(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    // Load saved data from localStorage if available
    const savedBasics = getSavedCourseData()
    if (savedBasics) {
      setBasics(savedBasics)
    }

    // Your existing fetch logic
    const fetchDropdownData = async () => {
      try {
        const [instructorsData, categoriesData] = await Promise.all([listInstructors(), listCategories()])
        setInstructors(instructorsData)
        setCategories(categoriesData)
      } catch (err) {
        console.error("Failed to load instructors or categories:", err)
      } finally {
        setLoadingLists(false)
      }
    }

    fetchDropdownData()
  }, [])

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await listCourses()
        setCourses(data)
      } catch (error) {
        console.error("Error fetching courses:", error)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [instructorsData, categoriesData] = await Promise.all([listInstructors(), listCategories()])
        setInstructors(instructorsData)
        setCategories(categoriesData)
      } catch (err) {
        console.error("Failed to load instructors or categories:", err)
      } finally {
        setLoadingLists(false)
      }
    }

    fetchDropdownData()
  }, [])

  const handleCreateCourse = async (formData) => {
    const newCourse = {
      id: Date.now().toString(),
      title: formData.get("title"),
      summary: formData.get("summary"),
      description: formData.get("description"),
      longDescription: formData.get("longDescription"),
      instructorId: "2",
      instructorName: "John Instructor",
      category: formData.get("category"),
      tags: formData.get("tags")
        ? formData
            .get("tags")
            .split(",")
            .map((tag) => tag.trim())
        : [],
      level: formData.get("level"),
      duration: Number.parseInt(formData.get("duration")),
      estimatedHours: Number.parseInt(formData.get("estimatedHours") || "0"),
      price: Number.parseFloat(formData.get("price")),
      passThreshold: Number.parseInt(formData.get("passThreshold") || "70"),
      visibility: formData.get("visibility") || "draft",
      prerequisites: [],
      coverImage: formData.get("coverImage"),
      isPublished: false,
      modules: [],
      settings: {
        enrollmentType: "open",
        enrollmentCap: null,
        certificateEnabled: true,
        progressTracking: true,
        allowRetakes: true,
        maxAttempts: 3,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setIsCreateDialogOpen(false)
    const updatedCourses = [...courses, newCourse]
    setCourses(updatedCourses)

    if (formData.get("openBuilder") === "true") {
      setCurrentCourseBuilder(newCourse)
      setShowAdvancedCreator(true)
    }
  }

  const [basics, setBasics] = useState({
    title: "",
    summary: "",
    cover_image_url: "",
    category_id: null,
    estimated_duration_minutes: null,
    price: "",
    currency: "USD",
    primary_instructor_id: null,
    is_published: false,
    pass_threshold: 70,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [savedCourse, setSavedCourse] = useState(null)
  const [step, setStep] = useState(1) // current step (Basics = 1)

  const handleDeleteCourse = (courseId) => {
    if (confirm("Are you sure you want to delete this course?")) {
      const updatedCourses = courses.filter((c) => c.id !== courseId)
      setCourses(updatedCourses)
    }
  }

  const togglePublishCourse = (courseId) => {
    const updatedCourses = courses.map((c) => (c.id === courseId ? { ...c, isPublished: !c.isPublished } : c))
    setCourses(updatedCourses)
  }

  const CourseBuilder = ({ course, onClose, onSave }) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const getInitialTab = () => {
      const urlTab = searchParams.get("tab")
      if (urlTab) return urlTab

      const savedTab = localStorage.getItem("courseBuilder_activeTab")
      return savedTab || "basics"
    }

    const [activeTab, setActiveTab] = useState(getInitialTab)

    const getInitialCourseData = () => {
      const saved = localStorage.getItem(`courseBuilder_data_${course.id}`)
      return saved ? JSON.parse(saved) : course
    }

    const getInitialModules = () => {
      const saved = localStorage.getItem(`courseBuilder_modules_${course.id}`)
      return saved ? JSON.parse(saved) : course.modules || []
    }

    const getInitialStep = () => {
      const saved = localStorage.getItem(`courseBuilder_step_${course.id}`)
      return saved ? Number.parseInt(saved) : 1
    }

    const [courseData, setCourseData] = useState(getInitialCourseData)
    const [modules, setModules] = useState(getInitialModules)
    const [step, setStep] = useState(getInitialStep)
    const [lastSaved, setLastSaved] = useState(new Date())
    const [autoSaveTimer, setAutoSaveTimer] = useState(null)
    const [validationErrors, setValidationErrors] = useState({})
    const [draggedModule, setDraggedModule] = useState(null)

    const handleTabChange = (newTab) => {
      setActiveTab(newTab)

      // Update URL
      const params = new URLSearchParams(searchParams)
      params.set("tab", newTab)
      router.push(`?${params.toString()}`, { scroll: false })

      // Save to localStorage
      localStorage.setItem("courseBuilder_activeTab", newTab)
    }

    const autoSave = () => {
      const updatedCourse = { ...courseData, modules, updatedAt: new Date() }
      const updatedCourses = courses.map((c) => (c.id === course.id ? updatedCourse : c))
      setCourses(updatedCourses)
      setLastSaved(new Date())

      // Save to localStorage
      localStorage.setItem(`courseBuilder_data_${course.id}`, JSON.stringify(courseData))
      localStorage.setItem(`courseBuilder_modules_${course.id}`, JSON.stringify(modules))
      localStorage.setItem(`courseBuilder_step_${course.id}`, step.toString())
    }

    useEffect(() => {
      localStorage.setItem(`courseBuilder_data_${course.id}`, JSON.stringify(courseData))
    }, [courseData, course.id])

    useEffect(() => {
      localStorage.setItem(`courseBuilder_modules_${course.id}`, JSON.stringify(modules))
    }, [modules, course.id])

    useEffect(() => {
      localStorage.setItem(`courseBuilder_step_${course.id}`, step.toString())
    }, [step, course.id])

    useEffect(() => {
      const urlTab = searchParams.get("tab")
      if (!urlTab && activeTab !== "basics") {
        const params = new URLSearchParams(searchParams)
        params.set("tab", activeTab)
        router.push(`?${params.toString()}`, { scroll: false })
      }
    }, [])

    useEffect(() => {
      const timer = setInterval(autoSave, 30000)
      return () => clearInterval(timer)
    }, [courseData, modules])

    const validateCourse = () => {
      const errors = {}

      if (!courseData.title || courseData.title.length < 5 || courseData.title.length > 120) {
        errors.title = "Title must be 5-120 characters"
      }

      if (!courseData.description) {
        errors.description = "Description is required"
      }

      // Check for modules without content
      modules.forEach((module, index) => {
        if (!module.lessons?.length && !module.quizzes?.length) {
          errors[`module_${index}`] = `Module "${module.title}" has no content`
        }
      })

      setValidationErrors(errors)
      return Object.keys(errors).length === 0
    }

    const handleSave = () => {
      if (validateCourse()) {
        autoSave()
        onSave({ ...courseData, modules })
      }
    }

    const handleModuleDragStart = (e, moduleId) => {
      setDraggedModule(moduleId)
    }

    const handleModuleDragOver = (e) => {
      e.preventDefault()
    }

    const handleModuleDrop = (e, targetModuleId) => {
      e.preventDefault()
      if (draggedModule && draggedModule !== targetModuleId) {
        const draggedIndex = modules.findIndex((m) => m.id === draggedModule)
        const targetIndex = modules.findIndex((m) => m.id === targetModuleId)

        const newModules = [...modules]
        const [draggedItem] = newModules.splice(draggedIndex, 1)
        newModules.splice(targetIndex, 0, draggedItem)

        // Update positions
        newModules.forEach((module, index) => {
          module.position = index
        })

        setModules(newModules)
      }
      setDraggedModule(null)
    }

    const addModule = () => {
      const newModule = {
        id: Date.now().toString(),
        title: "New Module",
        summary: "",
        position: modules.length,
        lessons: [],
        quizzes: [],
        isExpanded: true,
      }
      setModules([...modules, newModule])
    }

    const updateModule = (moduleId, updates) => {
      setModules(modules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m)))
    }

    const deleteModule = (moduleId) => {
      if (confirm("Delete this module and all its content?")) {
        setModules(modules.filter((m) => m.id !== moduleId))
      }
    }

    const addLesson = (moduleId) => {
      const newLesson = {
        id: Date.now().toString(),
        title: "New Lesson",
        content: "",
        type: "article",
        videoUrl: "",
        videoDuration: 0,
        resources: [],
        estimatedTime: 0,
        position: 0,
        completionRule: "manual",
        completionThreshold: 90,
        seo: {
          metaTitle: "",
          metaDescription: "",
        },
      }

      setModules(modules.map((m) => (m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), newLesson] } : m)))
    }

    const addQuiz = (moduleId) => {
      const newQuiz = {
        id: Date.now().toString(),
        title: "New Quiz",
        description: "",
        timeLimit: null,
        attemptsAllowed: 3,
        shuffleQuestions: false,
        shuffleOptions: false,
        showFeedback: "on_finish",
        allowReview: true,
        weight: 1,
        questions: [],
        settings: {
          passingScore: 70,
          showCorrectAnswers: true,
          allowSkip: false,
          randomizeOrder: false,
        },
      }

      setModules(modules.map((m) => (m.id === moduleId ? { ...m, quizzes: [...(m.quizzes || []), newQuiz] } : m)))
    }

    const addQuestion = (moduleId, quizId, type = "single_choice") => {
      const newQuestion = {
        id: Date.now().toString(),
        type,
        prompt: "",
        points: 1,
        explanation: "",
        tags: [],
        options:
          type === "single_choice" || type === "multiple_choice"
            ? [
                { id: "1", text: "", isCorrect: false },
                { id: "2", text: "", isCorrect: false },
              ]
            : [],
        correctAnswer: type === "short_text" ? "" : null,
      }

      setModules(
        modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                quizzes: m.quizzes.map((q) =>
                  q.id === quizId ? { ...q, questions: [...q.questions, newQuestion] } : q,
                ),
              }
            : m,
        ),
      )
    }

    if (authorized === null) return <p>Checking access...</p>
    if (!authorized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-red-500">Access Denied: Admins only</p>
        </div>
      )
    }

    return (
      
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="min-h-screen">
          {/* Header */}
          <div className="border-b bg-card sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={onClose}>
                    ← Back
                  </Button>
                  <div>
                    <h1 className="text-xl font-bold">{courseData.title}</h1>
                    <p className="text-sm text-muted-foreground">
                      Last saved: {lastSaved.toLocaleTimeString()}
                      {Object.keys(validationErrors).length > 0 && (
                        <span className="text-red-500 ml-2">
                          • {Object.keys(validationErrors).length} validation errors
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      if (validateCourse()) {
                        setCourseData({ ...courseData, visibility: "published" })
                        handleSave()
                      }
                    }}
                    disabled={Object.keys(validationErrors).length > 0}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          </div>

       
        </div>
      </div>
    )
  }

  

  if (showAdvancedCreator && currentCourseBuilder) {
    return (
      <CourseBuilderWithSidebar
        course={currentCourseBuilder}
        instructors={instructors}
        categories={categories}
        onBack={() => {                    // close builder
          setShowAdvancedCreator(false)
          setCurrentCourseBuilder(null)
        }}
        onSave={(updated) => {             // keep your existing save flow
          setCurrentCourseBuilder(updated)
        }}
      />
    )
  }

  const adminSidebarItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <Home className="h-4 w-4" />,
    },
    {
      id: "courses",
      label: "Courses",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: "users",
      label: "Users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ]

  const renderAdminContent = () => {
    // Replace the existing TabsContent with direct content rendering
    switch (activeTab) {
      case "overview":
        return <LMSOverview />
      case "courses":
        return < CoursesSection />
      case "users":
        return <div className="space-y-6">{/* Users content */}</div>
      case "analytics":
        return <div className="space-y-6">{/* Analytics content */}</div>
      default:
        return <div>Content for {activeTab}</div>
    }
  }

// ✅ Embed mode: no internal header/sidebar, just the content body
  if (disableInternalSidebar) {
    return <div className="min-h-[calc(100vh-4rem)] p-0">{renderAdminContent()}</div>
  }

  // Standalone mode (keeps existing internal header + sidebar)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your learning platform</p>
            </div>
            <div className="flex items-center gap-2">{/* Header actions */}</div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Admin Sidebar */}
        <Sidebar
          items={adminSidebarItems}
          activeItem={activeTab}
          onItemChange={setActiveTab}
          title="Admin Panel"
          collapsible={true}
        />
      </div>
</div>
  )}
export default AdminDashboard
