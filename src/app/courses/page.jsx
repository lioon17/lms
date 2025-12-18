"use client"

import { useEffect, useMemo, useState } from "react"
import { listCourses } from "@/lib/api/courses" // adjust path if needed
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Filter, Clock, Users, Star, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation";

// Adapter: map API course to UI fields the grid expects
function mapCourse(c) {
  return {
    id: c.id,
    title: c.title ?? c.name ?? "Untitled Course",
    description: c.description ?? "",
    category: c.category ?? c.topic ?? "General",
    difficulty: c.difficulty ?? c.level ?? "Beginner",
    duration: c.duration ?? c.duration_weeks ? `${c.duration_weeks} weeks` : "Self-paced",
    students: c.students ?? c.students_count ?? 0,
    rating: Number(c.rating ?? 0).toFixed(1),
    price: typeof c.price === "number" ? `$${c.price.toFixed(2)}` : c.price ?? "$0",
    image: c.image ?? c.image_url ?? "/placeholder.svg",
    instructor: c.instructor ?? c.instructor_name ?? "Instructor",
  }
}

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
 const router = useRouter();
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        // listCourses uses fetchAPI("/courses", { method: "GET", cache: "no-store" })
        // It may return { data: [...] } or a raw array. Support both.
        const res = await listCourses()
        const items = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        const mapped = items.map(mapCourse)
        if (isMounted) {
          setCourses(mapped)
          setError(null)
        }
      } catch (e) {
        if (isMounted) setError(e?.message || "Failed to load courses")
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set(["all"])
    courses.forEach(c => set.add(c.category))
    return Array.from(set)
  }, [courses])

  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === "all" || course.difficulty === selectedDifficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [courses, searchTerm, selectedCategory, selectedDifficulty])

 
   const handleEnroll = (courseId) => {
    const qs = new URLSearchParams({ courseId: String(courseId) }).toString();
    router.push(`/checkout?${qs}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading courses…
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => location.reload()}>Retry</Button>
      </div>
    )
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
                <h1 className="text-xl font-semibold text-balance">Course Catalog</h1>
                <p className="text-sm text-muted-foreground">Discover and enroll in courses</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 rounded-md border bg-background text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-1 rounded-md border bg-background text-sm"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === "all" ? "All Levels" : difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-background/90">
                    {course.difficulty}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight text-balance">{course.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                  </div>
                </div>
                <CardDescription className="text-sm text-pretty">{course.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0 pb-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {Number(course.students).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="flex items-center justify-between w-full">
                  <div className="text-lg font-semibold text-primary">{course.price}</div>
                  <Button onClick={() => handleEnroll(course.id)} className="bg-primary hover:bg-primary/90">
                    Enroll Now
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search terms or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedDifficulty("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
