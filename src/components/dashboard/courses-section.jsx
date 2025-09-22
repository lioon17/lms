"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Users,
  BookOpen,
  Clock,
  DollarSign,
  Star,
} from "lucide-react"



import { listCourses  , createCourse  } from "@/lib/api/courses"
import { listCategories } from "@/lib/api/categories"

// Helper: map API row -> UI card shape your grid expects
function minutesToText(min) {
  if (!min) return "—"
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}
function mapCourseRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.summary || "",
    instructor: row.creator_name || "—",
    category: row.category_name || "Uncategorized",
    status: row.is_published ? "published" : "draft",
    enrollments: 0,              // no enrollments in API -> placeholder
    rating: 0,                   // no rating in API -> placeholder
    price: Number(row.price || 0),
    duration: minutesToText(row.estimated_duration_minutes),
    lessons: 0,
    lastUpdated: "",             // add if your API returns updated_at
    thumbnail: row.cover_image_url || "/placeholder.svg",
    modules: [],
    quizzes: [],
    certificateSettings: { enabled: false },
  }
}
 
 const mockInstructors = [
   { id: 1, name: "John Doe", email: "john@example.com" },
   { id: 2, name: "Jane Smith", email: "jane@example.com" },
   { id: 3, name: "Mike Johnson", email: "mike@example.com" },
 ]

export function CoursesSection() {
  const [courses, setCourses] = useState([])         // ✅ API data
  const [kpis, setKpis] = useState(null)             // ✅ KPIs from API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [editingCourse, setEditingCourse] = useState(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [categories, setCategories] = useState([])  
  const router = useRouter()




     // Normalize helpers
  function normalizeCategories(res) {
    const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    return arr.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
  }

  // Load courses + categories via central client
  // Load from /api/courses via central client
  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setLoading(true)
        const [coursesRes, categoriesRes] = await Promise.all([
          listCourses(),
          listCategories().catch(() => ([])), // don't fail the whole page if categories throws
        ])
        if (!alive) return
      setKpis(coursesRes.kpis || null)
        const rows = Array.isArray(coursesRes.data) ? coursesRes.data : []
         setCourses(rows.map(mapCourseRow))
        setCategories(normalizeCategories(categoriesRes))
        setCourses(rows.map(mapCourseRow))
      } catch (e) {
        if (!alive) return
        setError(e.message || "Failed to load courses")
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])


  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || course.status === filterStatus
    return matchesSearch && matchesFilter
  })

 const handleEditCourse = (course) => {
    // ✅ Open builder page with this course id
    router.push(`/course-builder?courseId=${course.id}`)
  }

 
  const handleCreateCourse = () => {
    const newCourse = {
      id: Date.now(),
      title: "",
      description: "",
      instructor: "",
      category: "",
      status: "draft",
      enrollments: 0,
      rating: 0,
      price: 0,
      duration: "0 hours",
      lessons: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      thumbnail: "/new-course-thumbnail.jpg",
      modules: [],
      quizzes: [],
      certificateSettings: { enabled: false },
    }
    setCourses((prev) => [...prev, newCourse])
    setShowCreateDialog(false)
  }

  const handleDeleteCourse = (courseId) => {
    setCourses((prev) => prev.filter((course) => course.id !== courseId))
  }

  const getStatusBadge = (status) => {
    const variants = {
      published: "default",
      draft: "secondary",
      archived: "outline",
    }
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    )
  }

  // If editing a course, show the course builder

  return (
    <div className="space-y-6">
       {loading && <p className="text-sm text-muted-foreground">Loading courses…</p>}
      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage your course catalog</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => router.push("/course-builder")}>
           Create Course
        </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Start building a new course. You can add content and configure settings after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse}>Create Course</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.total_courses ?? courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {(kpis?.published_courses ?? courses.filter((c)=>c.status==="published").length)} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.reduce((sum, course) => sum + course.enrollments, 0)}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">
              {
                // Prefer API-provided KPIs if present; fallback to simple sum of published list prices
                kpis?.revenue_by_currency
                  ? kpis.revenue_by_currency.map(r => `${r.currency} ${Number(r.revenue || 0).toFixed(2)}`).join(" • ")
                  : `$${courses
                      .filter(c => c.status === "published")
                      .reduce((sum, c) => sum + (c.price || 0), 0)
                      .toFixed(2)}`
              }
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                courses.filter((c) => c.rating > 0).reduce((sum, course) => sum + course.rating, 0) /
                  courses.filter((c) => c.rating > 0).length || 0
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter: {filterStatus === "all" ? "All" : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Courses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("published")}>Published</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("draft")}>Draft</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("archived")}>Archived</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative w-full pt-[56.25%] bg-muted/20 overflow-hidden">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-2 right-2">{getStatusBadge(course.status)}</div>
              </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">by {course.instructor}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteCourse(course.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{course.enrollments ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.duration || "—"}</span>
                    </div>
                  </div>
                  {course.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                  <div className="text-lg font-bold">${Number(course.price || 0).toFixed(2)}</div>
                </div>

                <Button className="w-full" onClick={() => handleEditCourse(course)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first course"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
