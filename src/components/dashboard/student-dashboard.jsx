"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { DataStore } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Award,
  Clock,
  LogOut,
  Play,
  Search,
  Star,
  Users,
  BarChart3,
  Download,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

export function StudentDashboard({ user: userProp }) {
  const auth = typeof useAuth === "function" ? useAuth() : null
  const user = userProp || auth?.user || { id: "3", name: "Sam Student", role: "student" }
  const logout = auth?.logout || (() => {})
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [certificates, setCertificates] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const allCourses = DataStore.getCourses()
    const userEnrollments = DataStore.getEnrollments(user?.id)
    const userCertificates = DataStore.getCertificates(user?.id)

    setEnrollments(userEnrollments)
    setCertificates(userCertificates)

    const enrolledCourseIds = userEnrollments.map((e) => e.courseId)
    const enrolled = allCourses.filter((c) => enrolledCourseIds.includes(c.id))
    const available = allCourses.filter((c) => !enrolledCourseIds.includes(c.id) && c.isPublished)

    setEnrolledCourses(enrolled)
    setAvailableCourses(available)
  }, [user?.id])

  const handleEnroll = (courseId) => {
    const newEnrollment = {
      id: Date.now().toString(),
      userId: user.id,
      courseId,
      enrolledAt: new Date(),
      progress: 0,
      status: "active",
    }

    const updatedEnrollments = [...enrollments, newEnrollment]
    setEnrollments(updatedEnrollments)
    DataStore.saveEnrollments(updatedEnrollments)

    const course = availableCourses.find((c) => c.id === courseId)
    if (course) {
      setEnrolledCourses([...enrolledCourses, course])
      setAvailableCourses(availableCourses.filter((c) => c.id !== courseId))
    }
  }

  const handleGenerateCertificate = (courseId) => {
    const certificate = DataStore.generateCertificate(user.id, courseId)
    setCertificates([...certificates, certificate])
  }

  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || course.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(availableCourses.map((c) => c.category)))]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Student Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
              <p className="text-xs text-muted-foreground">Active learning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.filter((e) => e.status === "completed").length}</div>
              <p className="text-xs text-muted-foreground">Courses finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates.length}</div>
              <p className="text-xs text-muted-foreground">Earned certificates</p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Section */}
        {certificates.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold">My Certificates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => {
                const course =
                  enrolledCourses.find((c) => c.id === certificate.courseId) ||
                  DataStore.getCourses().find((c) => c.id === certificate.courseId)
                return (
                  <Card key={certificate.id} className="hover:shadow-md transition-shadow border-emerald-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          <Award className="h-3 w-3 mr-1" />
                          Certificate
                        </Badge>
                        <Badge variant="outline">{course?.level}</Badge>
                      </div>
                      <CardTitle className="text-lg">{course?.title}</CardTitle>
                      <CardDescription>
                        Completed on {new Date(certificate.issuedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Link href={`/certificate/${certificate.id}`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Certificate
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Continue Learning */}
        {enrolledCourses.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((course) => {
                const enrollment = enrollments.find((e) => e.courseId === course.id)
                const hasCertificate = certificates.some((c) => c.courseId === course.id)
                const isCompleted = enrollment?.status === "completed" && enrollment.progress === 100

                return (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{course.level}</Badge>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{course.category}</Badge>
                          {hasCertificate && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                              <Award className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{enrollment?.progress || 0}%</span>
                          </div>
                          <Progress value={enrollment?.progress || 0} />
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/course/${course.id}`} className="flex-1">
                            <Button className="w-full">
                              <Play className="h-4 w-4 mr-2" />
                              {isCompleted ? "Review Course" : "Continue Learning"}
                            </Button>
                          </Link>
                          {isCompleted && !hasCertificate && (
                            <Button
                              variant="outline"
                              onClick={() => handleGenerateCertificate(course.id)}
                              className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                            >
                              <Award className="h-4 w-4 mr-2" />
                              Get Certificate
                            </Button>
                          )}
                          {hasCertificate && (
                            <Link href={`/certificate/${certificates.find((c) => c.courseId === course.id)?.id}`}>
                              <Button
                                variant="outline"
                                className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                              >
                                <Award className="h-4 w-4 mr-2" />
                                View Certificate
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Course Catalog */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Course Catalog</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border border-input bg-background rounded-md"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{course.level}</Badge>
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {Math.floor(course.duration / 60)}h {course.duration % 60}m
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {Math.floor(Math.random() * 500) + 100}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        4.{Math.floor(Math.random() * 9) + 1}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold">${course.price}</div>
                      <div className="text-sm text-muted-foreground">by {course.instructorName}</div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/course/${course.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </Link>
                      <Button className="flex-1" onClick={() => handleEnroll(course.id)}>
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
