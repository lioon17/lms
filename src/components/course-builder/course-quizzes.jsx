"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  FileQuestion,
  Edit,
  Trash2,
  Clock,
  Save,
  Eye,
  Shuffle,
  Target,
  Award,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Copy,
} from "lucide-react"
 import {
   createQuiz as apiCreateQuiz,
   updateQuiz as apiUpdateQuiz,
   deleteQuiz as apiDeleteQuiz,
   normalizeQuiz,
 } from "@/lib/api/quizzes"


/** --- helpers --- */
async function tryGet(url) {
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function getArrayFrom(any, key) {
  if (!any) return []
  if (Array.isArray(any)) return any
  if (key && Array.isArray(any[key])) return any[key]
  if (Array.isArray(any.data)) return any.data
  if (key && any.data && Array.isArray(any.data[key])) return any.data[key]
  return []
}

function getQuizzesFrom(any) {
  if (!any) return []
  if (Array.isArray(any)) return any
  if (Array.isArray(any.quizzes)) return any.quizzes
  if (any.data && Array.isArray(any.data)) return any.data
  if (any.data && Array.isArray(any.data?.quizzes)) return any.data.quizzes
  return []
}

export function CourseQuizzes({ course, onUpdate, onSave }) {
  const effectiveCourseId = useMemo(() => course?.course_id || course?.id, [course?.course_id, course?.id])

  const stableModules = useMemo(() => (Array.isArray(course?.modules) ? course.modules : []), [course?.modules])

  const [moduleData, setModuleData] = useState(stableModules)
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false)
   const [editingQuiz, setEditingQuiz] = useState(null)
  const [editDraft, setEditDraft] = useState(null)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterScope, setFilterScope] = useState("all")
  const [showStats, setShowStats] = useState(false)
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    scope: "module",
    moduleId: "",
    lessonId: "",
    timeLimit: 30,
    attemptsAllowed: 3,
    weight: 1,
    feedbackMode: "immediate",
    isFinal: false,
    shuffleQuestions: false,
  })

  const handleModuleDataUpdate = useCallback(
    (newModules) => {
      setModuleData(newModules)
      onUpdate?.({ ...course, modules: newModules })
    },
    [course, onUpdate],
  )

  const loadModulesIfNeeded = useCallback(async () => {
    if (Array.isArray(moduleData) && moduleData.length > 0) return moduleData
    if (!effectiveCourseId) return []

    // Try a few common endpoints in order
    const candidates = [
      `/api/courses/${effectiveCourseId}/modules?include=lessons=true`,
      `/api/courses/${effectiveCourseId}/modules`,
      `/api/modules?course_id=${effectiveCourseId}`,
    ]

    let modules = []
    for (const url of candidates) {
      const resp = await tryGet(url)
      modules = getArrayFrom(resp, "modules")
      if (modules.length > 0) break
    }

    // If lessons not present, try to fetch per module
    const modulesWithLessons = await Promise.all(
      modules.map(async (m) => {
        let lessons = Array.isArray(m.lessons) ? m.lessons : []
        if (lessons.length === 0) {
          const lessonCandidates = [`/api/modules/${m.id}/lessons`, `/api/lessons?module_id=${m.id}`]
          for (const url of lessonCandidates) {
            const lr = await tryGet(url)
            const lx = getArrayFrom(lr, "lessons")
            if (lx.length > 0) {
              lessons = lx
              break
            }
          }
        }
        return { ...m, lessons }
      }),
    )

    if (modulesWithLessons.length > 0) {
      setModuleData(modulesWithLessons)
      onUpdate?.({ ...course, modules: modulesWithLessons })
    }
    return modulesWithLessons
  }, [moduleData, effectiveCourseId])

  const refreshFromApi = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const baseModules = await loadModulesIfNeeded()
      if (!Array.isArray(baseModules) || baseModules.length === 0) {
        setError("No modules found for this course. Make sure modules are loaded or create some first.")
        setLoading(false)
        return
      }

      const mergedModules = await Promise.all(
        baseModules.map(async (mod) => {
          const [moduleQuizzesResp, ...lessonQuizzesResps] = await Promise.all([
            tryGet(`/api/modules/${mod.id}/quizzes`),
            ...(mod.lessons || []).map((lsn) => tryGet(`/api/lessons/${lsn.id}/quizzes`)),
          ])

          const moduleQuizzes = getQuizzesFrom(moduleQuizzesResp)

          const lessonsWithQuizzes = (mod.lessons || []).map((lsn, index) => {
            const lessonQuizzes = getQuizzesFrom(lessonQuizzesResps[index])
            return { ...lsn, quizzes: lessonQuizzes }
          })

          return { ...mod, quizzes: moduleQuizzes, lessons: lessonsWithQuizzes }
        }),
      )

      handleModuleDataUpdate(mergedModules)
    } catch (e) {
      setError(e?.message || "Failed to load quizzes")
    } finally {
      setLoading(false)
    }
  }, [loadModulesIfNeeded, handleModuleDataUpdate])

  useEffect(() => {
    if (!effectiveCourseId) return

    let isCancelled = false

    const loadData = async () => {
      try {
        await refreshFromApi()
      } catch (error) {
        if (!isCancelled) {
          console.error("Error in useEffect:", error)
        }
      }
    }

    loadData()

    return () => {
      isCancelled = true
    }
  }, [effectiveCourseId]) // Remove refreshFromApi from deps to prevent infinite loops

  const deleteQuiz = (moduleId, quizId) => {
    const updatedModules = moduleData.map((module) => {
      if (module.id === moduleId) {
        return {
          ...module,
          quizzes: (module.quizzes || []).filter((quiz) => quiz.quiz_id !== quizId),
        }
      }
      return module
    })
    handleModuleDataUpdate(updatedModules)
  }

  const getFeedbackModeBadge = (mode) => {
    const colors = {
      immediate: "bg-green-100 text-green-800",
      on_finish: "bg-blue-100 text-blue-800",
      none: "bg-gray-100 text-gray-800",
    }
    const labels = { immediate: "Immediate", on_finish: "On Finish", none: "None" }
    return { color: colors[mode] || colors.none, label: labels[mode] || "None" }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "No duration"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getQuizStats = () => {
    let totalQuizzes = 0
    let moduleQuizzes = 0
    let lessonQuizzes = 0
    let finalQuizzes = 0

    moduleData.forEach((module) => {
      const modQuizzes = module.quizzes || []
      moduleQuizzes += modQuizzes.length
      totalQuizzes += modQuizzes.length
      finalQuizzes += modQuizzes.filter((q) => q.is_final === 1).length

      module.lessons?.forEach((lesson) => {
        const lsnQuizzes = lesson.quizzes || []
        lessonQuizzes += lsnQuizzes.length
        totalQuizzes += lsnQuizzes.length
        finalQuizzes += lsnQuizzes.filter((q) => q.is_final === 1).length
      })
    })

    return { totalQuizzes, moduleQuizzes, lessonQuizzes, finalQuizzes }
  }

  const getFilteredModules = () => {
    if (!searchTerm && filterScope === "all") return moduleData

    return moduleData
      .map((module) => {
        let filteredModuleQuizzes = module.quizzes || []
        let filteredLessons = module.lessons || []

        if (searchTerm) {
          filteredModuleQuizzes = filteredModuleQuizzes.filter((quiz) =>
            quiz.quiz_title?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          filteredLessons = filteredLessons.map((lesson) => ({
            ...lesson,
            quizzes: (lesson.quizzes || []).filter((quiz) =>
              quiz.quiz_title?.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          }))
        }

        if (filterScope !== "all") {
          if (filterScope === "module") {
            filteredLessons = filteredLessons.map((lesson) => ({ ...lesson, quizzes: [] }))
          } else if (filterScope === "lesson") {
            filteredModuleQuizzes = []
          }
        }

        return {
          ...module,
          quizzes: filteredModuleQuizzes,
          lessons: filteredLessons,
        }
      })
      .filter((module) => module.quizzes?.length > 0 || module.lessons?.some((lesson) => lesson.quizzes?.length > 0))
  }

 const handleCreateQuiz = async () => {
    try {
      setLoading(true)
      setError(null)
      // Build API payload
      const payload = {
        title: newQuiz.title,
        description: newQuiz.description,
        scope: newQuiz.scope, // "module" | "lesson"
        module_id: newQuiz.moduleId ? Number(newQuiz.moduleId) : null,
        lesson_id: newQuiz.scope === "lesson" && newQuiz.lessonId ? Number(newQuiz.lessonId) : null,
        attempts_allowed: Number(newQuiz.attemptsAllowed || 1),
        time_limit_seconds: Number(newQuiz.timeLimit || 0) * 60 || null,
        weight: Number(newQuiz.weight || 1),
        shuffle_questions: Boolean(newQuiz.shuffleQuestions),
        shuffle_options: false,
        feedback_mode: newQuiz.feedbackMode || "immediate",
        is_final: newQuiz.isFinal ? 1 : 0,
      }
      const created = await apiCreateQuiz(payload)       // ← POST /api/quizzes
      const createdUI = normalizeQuiz(created)

      const updatedModules = moduleData.map((module) => {
        if (String(module.id) !== String(newQuiz.moduleId)) return module
        if (createdUI.scope === "module") {
          return { ...module, quizzes: [...(module.quizzes || []), createdUI] }
        }
        // lesson quiz
        return {
          ...module,
          lessons: (module.lessons || []).map((lesson) =>
            String(lesson.id) === String(newQuiz.lessonId)
              ? { ...lesson, quizzes: [...(lesson.quizzes || []), createdUI] }
              : lesson
          ),
        }
      })

      handleModuleDataUpdate(updatedModules)
      setIsAddQuizOpen(false)
      setNewQuiz({
        title: "",
        description: "",
        scope: "module",
        moduleId: "",
        lessonId: "",
        timeLimit: 30,
        attemptsAllowed: 3,
        weight: 1,
        feedbackMode: "immediate",
        isFinal: false,
        shuffleQuestions: false,
      })
    } catch (error) {
      console.error(error)
      setError(error?.message || "Failed to create quiz")
    } finally {
      setLoading(false)
    }
  }

  const stats = getQuizStats()
  const filteredModules = getFilteredModules()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Course Quizzes</h2>
            <p className="text-muted-foreground">Manage quizzes organized by modules and lessons</p>
            {loading && <p className="text-xs text-muted-foreground mt-1">Loading from database…</p>}
            {error && <p className="text-xs text-red-600 mt-1">Error: {error}</p>}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowStats(!showStats)} variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {showStats ? "Hide Stats" : "Show Stats"}
            </Button>
            <Button onClick={onSave} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button onClick={refreshFromApi} variant="outline" className="flex items-center gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Refresh from DB
            </Button>
            <Dialog open={isAddQuizOpen} onOpenChange={setIsAddQuizOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Quiz</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-title">Quiz Title</Label>
                      <Input
                        id="quiz-title"
                        value={newQuiz.title}
                        onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                        placeholder="Enter quiz title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiz-scope">Scope</Label>
                      <Select value={newQuiz.scope} onValueChange={(value) => setNewQuiz({ ...newQuiz, scope: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="module">Module Quiz</SelectItem>
                          <SelectItem value="lesson">Lesson Quiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quiz-description">Description</Label>
                    <Textarea
                      id="quiz-description"
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="module-select">Module</Label>
                      <Select
                       value={newQuiz.moduleId}
                       onValueChange={(value) => setNewQuiz({ ...newQuiz, moduleId: value, lessonId: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                          {moduleData.map((module) => (
                            <SelectItem key={module.id} value={String(module.id)}>
                              {module.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newQuiz.scope === "lesson" && (
                      <div className="space-y-2">
                        <Label htmlFor="lesson-select">Lesson</Label>
                        <Select
                          value={newQuiz.lessonId}
                           onValueChange={(value) => setNewQuiz({ ...newQuiz, lessonId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select lesson" />
                          </SelectTrigger>
                          <SelectContent>
                            {moduleData
                              .find((m) => m.id === newQuiz.moduleId)
                              ?.lessons?.map((lesson) => (
                                <SelectItem key={lesson.id} value={String(lesson.id)}>
                                  {lesson.title}
                                </SelectItem>
                              )) || []}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        value={newQuiz.timeLimit}
                        onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: Number.parseInt(e.target.value) || 0 })}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attempts">Attempts Allowed</Label>
                      <Input
                        id="attempts"
                        type="number"
                        value={newQuiz.attemptsAllowed}
                        onChange={(e) =>
                          setNewQuiz({ ...newQuiz, attemptsAllowed: Number.parseInt(e.target.value) || 1 })
                        }
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newQuiz.weight}
                        onChange={(e) => setNewQuiz({ ...newQuiz, weight: Number.parseFloat(e.target.value) || 1 })}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback-mode">Feedback Mode</Label>
                    <Select
                      value={newQuiz.feedbackMode}
                      onValueChange={(value) => setNewQuiz({ ...newQuiz, feedbackMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="on_finish">On Finish</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-final"
                        checked={newQuiz.isFinal}
                        onCheckedChange={(checked) => setNewQuiz({ ...newQuiz, isFinal: checked })}
                      />
                      <Label htmlFor="is-final">Final Quiz</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="shuffle-questions"
                        checked={newQuiz.shuffleQuestions}
                        onCheckedChange={(checked) => setNewQuiz({ ...newQuiz, shuffleQuestions: checked })}
                      />
                      <Label htmlFor="shuffle-questions">Shuffle Questions</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddQuizOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateQuiz} disabled={!newQuiz.title || !newQuiz.moduleId}>
                      Create Quiz
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {showStats && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalQuizzes}</div>
                  <div className="text-sm text-muted-foreground">Total Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.moduleQuizzes}</div>
                  <div className="text-sm text-muted-foreground">Module Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{stats.lessonQuizzes}</div>
                  <div className="text-sm text-muted-foreground">Lesson Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.finalQuizzes}</div>
                  <div className="text-sm text-muted-foreground">Final Quizzes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterScope} onValueChange={setFilterScope}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quizzes</SelectItem>
              <SelectItem value="module">Module Only</SelectItem>
              <SelectItem value="lesson">Lesson Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {Array.isArray(filteredModules) && filteredModules.length > 0 ? (
        <div className="space-y-6">
          {filteredModules.map((module) => {
            const moduleQuizzes = module.quizzes || []
            const moduleLessons = module.lessons || []

            return (
              <Card key={module.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <span>{module.title}</span>
                        <Badge variant="outline">{moduleQuizzes.length} module quizzes</Badge>
                        <Badge variant="secondary">
                          {moduleLessons.reduce((acc, lesson) => acc + (lesson.quizzes?.length || 0), 0)} lesson quizzes
                        </Badge>
                      </CardTitle>
                      {module.summary && <p className="text-sm text-muted-foreground">{module.summary}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {module.duration_seconds && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(module.duration_seconds)}
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewQuiz({ ...newQuiz, moduleId: module.id })
                          setIsAddQuizOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Quiz
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* === Module-level quizzes === */}
                  {moduleQuizzes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileQuestion className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No module-level quizzes yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={() => {
                          setNewQuiz({ ...newQuiz, moduleId: module.id, scope: "module" })
                          setIsAddQuizOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create First Quiz
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {moduleQuizzes.map((quiz) => {
                        const feedbackBadge = getFeedbackModeBadge(quiz.feedback_mode)
                        return (
                          <Card key={quiz.quiz_id} className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{quiz.quiz_title}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {quiz.scope || "module"}
                                    </Badge>
                                    {quiz.is_final === 1 && (
                                      <Badge variant="destructive" className="flex items-center gap-1">
                                        <Award className="h-3 w-3" />
                                        Final
                                      </Badge>
                                    )}
                                    <Badge className={feedbackBadge.color}>{feedbackBadge.label}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {quiz.quiz_created_at && (
                                      <span>Created: {new Date(quiz.quiz_created_at).toLocaleDateString()}</span>
                                    )}
                                    {quiz.quiz_updated_at && (
                                      <span>Updated: {new Date(quiz.quiz_updated_at).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="ghost" title="Preview Quiz">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" title="Duplicate Quiz">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                    const draft = { ...quiz, moduleId: module.id }
                                    setEditingQuiz(draft)
                                    setEditDraft({
                                      title: draft.quiz_title,
                                      description: draft.quiz_description || "",
                                      weight: Number(draft.weight || 1),
                                      attempts_allowed: Number(draft.attempts_allowed || 1),
                                      time_limit_minutes: draft.time_limit_seconds ? Math.round(draft.time_limit_seconds / 60) : 0,
                                      feedback_mode: draft.feedback_mode || "immediate",
                                      is_final: draft.is_final === 1,
                                      shuffle_questions: Boolean(draft.shuffle_questions),
                                    })
                                  }}
                                    title="Edit Quiz"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteQuiz(module.id, quiz.quiz_id)}
                                    title="Delete Quiz"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  <span>{quiz.attempts_allowed} attempts</span>
                                </div>
                                {quiz.time_limit_seconds && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{Math.round(quiz.time_limit_seconds / 60)} min</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <span>Weight: {quiz.weight}</span>
                                </div>
                                {quiz.shuffle_questions && (
                                  <div className="flex items-center gap-1">
                                    <Shuffle className="h-4 w-4" />
                                    <span>Shuffled</span>
                                  </div>
                                )}
                              </div>

                              {quiz.quiz_description && (
                                <p className="text-sm text-muted-foreground mb-3">{quiz.quiz_description}</p>
                              )}

                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Question
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview Quiz
                                </Button>
                                <Button size="sm" variant="outline">
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  Analytics
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}

                  {/* === Lesson-level quizzes === */}
                  {moduleLessons.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        Lesson Quizzes
                        <Badge variant="outline">
                          {moduleLessons.reduce((acc, lesson) => acc + (lesson.quizzes?.length || 0), 0)} total
                        </Badge>
                      </h4>
                      {moduleLessons.map((lesson) => (
                        <Card key={lesson.id} className="border-l-4 border-l-emerald-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{lesson.title}</span>
                                  <Badge variant="outline">{(lesson.quizzes || []).length} quizzes</Badge>
                                  {lesson.duration_seconds && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDuration(lesson.duration_seconds)}
                                    </Badge>
                                  )}
                                </div>
                                {lesson.summary && <p className="text-sm text-muted-foreground">{lesson.summary}</p>}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setNewQuiz({
                                      ...newQuiz,
                                      moduleId: module.id,
                                      lessonId: lesson.id,
                                      scope: "lesson",
                                    })
                                    setIsAddQuizOpen(true)
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Quiz
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {(lesson.quizzes || []).length === 0 ? (
                              <div className="text-sm text-muted-foreground py-4 text-center">
                                <FileQuestion className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                <p>No lesson quizzes yet</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 bg-transparent"
                                  onClick={() => {
                                    setNewQuiz({
                                      ...newQuiz,
                                      moduleId: module.id,
                                      lessonId: lesson.id,
                                      scope: "lesson",
                                    })
                                    setIsAddQuizOpen(true)
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Create Quiz
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {lesson.quizzes.map((quiz) => {
                                  const feedbackBadge = getFeedbackModeBadge(quiz.feedback_mode)
                                  return (
                                    <Card key={quiz.quiz_id} className="border-l-4 border-l-amber-500">
                                      <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <h5 className="font-medium">{quiz.quiz_title}</h5>
                                            <Badge variant="outline" className="text-xs">
                                              {quiz.scope || "lesson"}
                                            </Badge>
                                            {quiz.is_final === 1 && (
                                              <Badge variant="destructive" className="flex items-center gap-1">
                                                <Award className="h-3 w-3" />
                                                Final
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button size="sm" variant="ghost" title="Preview Quiz">
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" title="Edit Quiz">
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" title="Delete Quiz">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="pt-0">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                          <span>{quiz.attempts_allowed} attempts</span>
                                          {quiz.time_limit_seconds && (
                                            <span>{Math.round(quiz.time_limit_seconds / 60)} min</span>
                                          )}
                                          <span>Weight: {quiz.weight}</span>
                                          <Badge className={feedbackBadge.color}>{feedbackBadge.label}</Badge>
                                        </div>
                                        {quiz.quiz_description && (
                                          <p className="text-xs text-muted-foreground mb-2">{quiz.quiz_description}</p>
                                        )}
                                        <div className="flex gap-1">
                                          <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                                            <Plus className="h-3 w-3 mr-1" />
                                            Questions
                                          </Button>
                                          <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                                            <Eye className="h-3 w-3 mr-1" />
                                            Preview
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )
                                })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterScope !== "all" ? "No matching quizzes found" : "No modules available"}
            </h3>
            <p className="text-muted-foreground text-center mb-2">
              {searchTerm || filterScope !== "all"
                ? "Try adjusting your search or filter criteria"
                : "We couldn't find modules for this course. Ensure modules exist or add a modules endpoint."}
            </p>
            <div className="flex gap-2">
              {(searchTerm || filterScope !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterScope("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button variant="outline" onClick={refreshFromApi} className="flex items-center gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editingQuiz} onOpenChange={() => setEditingQuiz(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quiz: {editingQuiz?.quiz_title}</DialogTitle>
          </DialogHeader>
          {editingQuiz && (
            <div className="space-y-4">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Quiz Details</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quiz Title</Label>
                      <Input
                        value={editDraft?.title ?? ""}
                        onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight</Label>
                       <Input
                    type="number"
                    value={editDraft?.weight ?? 1}
                    onChange={(e) => setEditDraft((d) => ({ ...d, weight: Number(e.target.value || 1) }))}
                  />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                    rows={3}
                    value={editDraft?.description ?? ""}
                    onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                  />
                  </div>
                </TabsContent>
                <TabsContent value="questions" className="space-y-4">
                  <div className="text-center py-8">
                    <FileQuestion className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-4">Question management coming soon</p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Time Limit (minutes)</Label>
                       <Input
                        type="number"
                        value={editDraft?.time_limit_minutes ?? 0}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, time_limit_minutes: Number(e.target.value || 0) }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Attempts Allowed</Label>
                       <Input
                          type="number"
                          value={editDraft?.attempts_allowed ?? 1}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, attempts_allowed: Number(e.target.value || 1) }))
                          }
                        />
                      </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Feedback Mode</Label>
                     <Select
                        value={editDraft?.feedback_mode ?? "immediate"}
                        onValueChange={(value) => setEditDraft((d) => ({ ...d, feedback_mode: value }))}
                      >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="on_finish">On Finish</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={!!editDraft?.is_final}
                        onCheckedChange={(checked) => setEditDraft((d) => ({ ...d, is_final: checked }))}
                      />
                      <Label>Final Quiz</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                       <Switch
                    checked={!!editDraft?.shuffle_questions}
                    onCheckedChange={(checked) => setEditDraft((d) => ({ ...d, shuffle_questions: checked }))}
                  />
                      <Label>Shuffle Questions</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingQuiz(null)}>
                  Cancel
                </Button>
                <Button         
        onClick={async () => {
          try {
            setLoading(true)
            const updates = {
              title: editDraft.title,
              description: editDraft.description,
              weight: Number(editDraft.weight || 1),
              attempts_allowed: Number(editDraft.attempts_allowed || 1),
              time_limit_seconds: Number(editDraft.time_limit_minutes || 0) * 60 || null,
              feedback_mode: editDraft.feedback_mode || "immediate",
              is_final: editDraft.is_final ? 1 : 0,
              shuffle_questions: !!editDraft.shuffle_questions,
            }
            const updatedQuiz = await apiUpdateQuiz(editingQuiz.quiz_id, updates)
            const updatedUI = normalizeQuiz(updatedQuiz)

            // merge into moduleData (module vs lesson)
            const next = moduleData.map((m) => {
              if (String(m.id) !== String(editingQuiz.moduleId || editingQuiz.module_id)) return m
              // in module list?
              const inModule = (m.quizzes || []).some((q) => q.quiz_id === editingQuiz.quiz_id)
              if (inModule) {
                return {
                  ...m,
                  quizzes: (m.quizzes || []).map((q) => (q.quiz_id === editingQuiz.quiz_id ? updatedUI : q)),
                }
              }
              // else in a lesson
              return {
                ...m,
                lessons: (m.lessons || []).map((ls) => ({
                  ...ls,
                  quizzes: (ls.quizzes || []).map((q) => (q.quiz_id === editingQuiz.quiz_id ? updatedUI : q)),
                })),
              }
            })

            handleModuleDataUpdate(next)
            setEditingQuiz(null)
            setEditDraft(null)
          } catch (err) {
            console.error(err)
            setError(err?.message || "Failed to update quiz")
          } finally {
            setLoading(false)
          }
        }}
        >
          Save Changes
        </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
