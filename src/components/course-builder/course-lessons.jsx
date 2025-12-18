"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  Video,
  FileText,
  Monitor,
  Edit,
  Clock,
  Play,
  ImageIcon,
  Type,
  Code,
  ChevronDown,
  ChevronRight,
  GripVertical,
  CheckCircle,
} from "lucide-react"

export function CourseLessons({ course, onUpdate, onSave }) {
  console.log("CourseLessons received:", { course, modules: course.modules })
  const [lessonsByModule, setLessonsByModule] = useState({})
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [selectedModule, setSelectedModule] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [expandedLessons, setExpandedLessons] = useState({})
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [editingSection, setEditingSection] = useState(null)
  const [editingBlock, setEditingBlock] = useState(null)

  const modules = useMemo(() => course.modules || [], [course.modules])

  const handleLessonsUpdate = useCallback((moduleId, newLessons) => {
    setLessonsByModule((prev) => ({
      ...prev,
      [moduleId]: newLessons,
    }))
  }, [])

  useEffect(() => {
    // Initialize lessons from course modules with sections and blocks
    const initialLessons = {}
    modules.forEach((module) => {
      if (module.lessons) {
        initialLessons[String(module.id)] = module.lessons.map((lesson) => ({
          ...lesson,
          sections: lesson.sections || [
            {
              id: Date.now(),
              lesson_id: lesson.id,
              position: 1,
              title: "Introduction",
              body: "Welcome to this lesson...",
              est_read_seconds: 120,
              is_checkpoint: false,
              blocks: [
                {
                  id: Date.now() + 1,
                  section_id: Date.now(),
                  position: 1,
                  kind: "text",
                  content: "This is the main content of the section.",
                  media_url: null,
                },
              ],
            },
          ],
        }))
      }
    })
    setLessonsByModule(initialLessons)
  }, [modules])

  const addSection = async (sectionData) => {
    setIsLoading(true)
    setError(null)
    try {
      const newSection = {
        id: Date.now(),
        lesson_id: selectedLesson.id,
        position: (selectedLesson.sections?.length || 0) + 1,
        title: sectionData.title,
        body: sectionData.body,
        est_read_seconds: Number.parseInt(sectionData.est_read_seconds) || 120,
        is_checkpoint: sectionData.is_checkpoint || false,
        blocks: [],
      }

      // Find the lesson and add the section
      const moduleId = findModuleIdByLessonId(selectedLesson.id)
      if (moduleId) {
        const updatedLessons = lessonsByModule[moduleId].map((lesson) =>
          lesson.id === selectedLesson.id ? { ...lesson, sections: [...(lesson.sections || []), newSection] } : lesson,
        )
        handleLessonsUpdate(moduleId, updatedLessons)
      }

      setIsAddSectionOpen(false)
      setSelectedLesson(null)
    } catch (err) {
      setError(err.message || "Failed to create section")
      console.error("Error creating section:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const addBlock = async (blockData) => {
    setIsLoading(true)
    setError(null)
    try {
      const newBlock = {
        id: Date.now(),
        section_id: selectedSection.id,
        position: (selectedSection.blocks?.length || 0) + 1,
        kind: blockData.kind,
        content: blockData.content,
        media_url: blockData.media_url || null,
      }

      // Find the lesson and section, then add the block
      const moduleId = findModuleIdByLessonId(selectedLesson.id)
      if (moduleId) {
        const updatedLessons = lessonsByModule[moduleId].map((lesson) =>
          lesson.id === selectedLesson.id
            ? {
                ...lesson,
                sections: lesson.sections.map((section) =>
                  section.id === selectedSection.id
                    ? { ...section, blocks: [...(section.blocks || []), newBlock] }
                    : section,
                ),
              }
            : lesson,
        )
        handleLessonsUpdate(moduleId, updatedLessons)
      }

      setIsAddBlockOpen(false)
      setSelectedSection(null)
    } catch (err) {
      setError(err.message || "Failed to create block")
      console.error("Error creating block:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const findModuleIdByLessonId = (lessonId) => {
    for (const [moduleId, lessons] of Object.entries(lessonsByModule)) {
      if (lessons.find((lesson) => lesson.id === lessonId)) {
        return moduleId
      }
    }
    return null
  }

  const toggleLessonExpansion = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }))
  }

  const getBlockIcon = (kind) => {
    switch (kind) {
      case "text":
        return <Type className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getBlockColor = (kind) => {
    switch (kind) {
      case "text":
        return "bg-gray-100 text-gray-800"
      case "image":
        return "bg-green-100 text-green-800"
      case "video":
        return "bg-blue-100 text-blue-800"
      case "code":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const addLesson = async (lessonData) => {
    setIsLoading(true)
    setError(null)
    try {
      const newLesson = {
        id: Date.now(),
        title: lessonData.title,
        summary: lessonData.description,
        content: lessonData.content,
        video_url: lessonData.videoUrl,
        duration_seconds: lessonData.duration ? lessonData.duration * 60 : null,
        type: lessonData.type,
        sections: [],
      }

      handleLessonsUpdate(lessonData.moduleId, [...(lessonsByModule[lessonData.moduleId] || []), newLesson])
      setIsAddLessonOpen(false)
      setSelectedModule("")
    } catch (err) {
      setError(err.message || "Failed to create lesson")
      console.error("Error creating lesson:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateLessonHandler = async (lessonId, updates) => {
    setIsLoading(true)
    setError(null)
    try {
      // Find which module this lesson belongs to
      let moduleId = null
      for (const [modId, lessons] of Object.entries(lessonsByModule)) {
        if (lessons.find((lesson) => lesson.id === lessonId)) {
          moduleId = modId
          break
        }
      }

      if (moduleId) {
        const updatedLessons = lessonsByModule[moduleId].map((lesson) =>
          lesson.id === lessonId
            ? {
                ...lesson,
                ...updates,
                summary: updates.description,
                video_url: updates.videoUrl,
                duration_seconds: updates.duration ? updates.duration * 60 : null,
              }
            : lesson,
        )
        handleLessonsUpdate(moduleId, updatedLessons)
      }

      setEditingLesson(null)
    } catch (err) {
      setError(err.message || "Failed to update lesson")
      console.error("Error updating lesson:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteLessonHandler = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    setIsLoading(true)
    setError(null)
    try {
      // Find which module this lesson belongs to
      let moduleId = null
      for (const [modId, lessons] of Object.entries(lessonsByModule)) {
        if (lessons.find((lesson) => lesson.id === lessonId)) {
          moduleId = modId
          break
        }
      }

      if (moduleId) {
        const updatedLessons = lessonsByModule[moduleId].filter((lesson) => lesson.id !== lessonId)
        handleLessonsUpdate(moduleId, updatedLessons)
      }
    } catch (err) {
      setError(err.message || "Failed to delete lesson")
      console.error("Error deleting lesson:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getLessonsByModuleId = useCallback((moduleId) => lessonsByModule[String(moduleId)] || [], [lessonsByModule])

  const getLessonIcon = (type) => {
    switch (type) {
      case "Video":
        return <Video className="h-4 w-4" />
      case "Text":
        return <FileText className="h-4 w-4" />
      case "Interactive":
        return <Monitor className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getLessonTypeColor = (type) => {
    switch (type) {
      case "Video":
        return "bg-blue-100 text-blue-800"
      case "Text":
        return "bg-green-100 text-green-800"
      case "Interactive":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Lessons</h2>
          <p className="text-muted-foreground">Create and manage lessons with sections and content blocks</p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isAddLessonOpen}
            onOpenChange={(open) => {
              setIsAddLessonOpen(open)
              if (!open) setSelectedModule("")
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={isLoading}>
                <Plus className="h-4 w-4" />
                Add Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Lesson</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  addLesson({
                    moduleId: formData.get("moduleId"),
                    title: formData.get("title"),
                    description: formData.get("description"),
                    type: formData.get("type"),
                    duration: Number.parseInt(formData.get("duration")) || null,
                    content: formData.get("content"),
                    videoUrl: formData.get("videoUrl"),
                  })
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="moduleId">Module *</Label>
                    <input type="hidden" name="moduleId" value={selectedModule || ""} />
                    <Select value={selectedModule} onValueChange={(val) => setSelectedModule(val)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem key={module.id} value={String(module.id)}>
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Lesson Type *</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Interactive">Interactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input id="title" name="title" placeholder="Enter lesson title" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of the lesson"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" name="duration" type="number" placeholder="15" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL (if video lesson)</Label>
                    <Input id="videoUrl" name="videoUrl" placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Lesson Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Enter lesson content, notes, or instructions"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddLessonOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Lesson"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && modules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading lessons...</p>
          </CardContent>
        </Card>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No modules available</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to create modules first before adding lessons
            </p>
            <Button variant="outline">Go to Modules</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {modules.map((module) => {
            const moduleLessons = getLessonsByModuleId(module.id)

            return (
              <Card key={module.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{module.title}</span>
                      <Badge variant="outline">{moduleLessons.length} lessons</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedModule(module.id)
                        setIsAddLessonOpen(true)
                      }}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lesson
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {moduleLessons.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No lessons in this module yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {moduleLessons.map((lesson, index) => (
                        <div key={lesson.id} className="border rounded-lg">
                          <div className="flex items-center gap-4 p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLessonExpansion(lesson.id)}
                              className="p-1"
                            >
                              {expandedLessons[lesson.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>

                            <div className="flex items-center gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${getLessonTypeColor(lesson.type)}`}>
                                {getLessonIcon(lesson.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{lesson.title}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {lesson.type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.sections?.length || 0} sections
                                  </Badge>
                                </div>
                                {lesson.summary && <p className="text-sm text-muted-foreground">{lesson.summary}</p>}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {lesson.duration_seconds && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{Math.round(lesson.duration_seconds / 60)}m</span>
                                </div>
                              )}
                              {lesson.video_url && (
                                <div className="flex items-center gap-1">
                                  <Play className="h-4 w-4" />
                                  <span>Video</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLesson(lesson)
                                  setIsAddSectionOpen(true)
                                }}
                                disabled={isLoading}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Section
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingLesson(lesson)}
                                disabled={isLoading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {expandedLessons[lesson.id] && (
                            <div className="border-t bg-gray-50 p-4">
                              <div className="space-y-3">
                                {lesson.sections?.length === 0 ? (
                                  <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground">No sections yet</p>
                                  </div>
                                ) : (
                                  lesson.sections?.map((section, sectionIndex) => (
                                    <div key={section.id} className="bg-white border rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <GripVertical className="h-4 w-4 text-gray-400" />
                                          <span className="font-medium">{section.title}</span>
                                          {section.is_checkpoint && (
                                            <Badge variant="secondary" className="text-xs">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Checkpoint
                                            </Badge>
                                          )}
                                          <Badge variant="outline" className="text-xs">
                                            {section.est_read_seconds}s read
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedLesson(lesson)
                                              setSelectedSection(section)
                                              setIsAddBlockOpen(true)
                                            }}
                                            disabled={isLoading}
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Block
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingSection(section)}
                                            disabled={isLoading}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>

                                      {section.body && (
                                        <p className="text-sm text-muted-foreground mb-3">{section.body}</p>
                                      )}

                                      {/* Blocks */}
                                      <div className="space-y-2">
                                        {section.blocks?.map((block, blockIndex) => (
                                          <div
                                            key={block.id}
                                            className="flex items-center gap-3 p-2 bg-gray-50 rounded border"
                                          >
                                            <div className={`p-1 rounded ${getBlockColor(block.kind)}`}>
                                              {getBlockIcon(block.kind)}
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                  {block.kind}
                                                </Badge>
                                                <span className="text-sm">Position {block.position}</span>
                                              </div>
                                              <p className="text-sm text-muted-foreground truncate">
                                                {block.content || block.media_url}
                                              </p>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => setEditingBlock(block)}
                                              disabled={isLoading}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              addSection({
                title: formData.get("title"),
                body: formData.get("body"),
                est_read_seconds: formData.get("est_read_seconds"),
                is_checkpoint: formData.get("is_checkpoint") === "on",
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="section-title">Section Title *</Label>
              <Input id="section-title" name="title" placeholder="Enter section title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section-body">Section Body</Label>
              <Textarea id="section-body" name="body" placeholder="Enter section content" rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="est-read-seconds">Estimated Read Time (seconds)</Label>
                <Input
                  id="est-read-seconds"
                  name="est_read_seconds"
                  type="number"
                  placeholder="120"
                  min="0"
                  defaultValue="120"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Checkbox name="is_checkpoint" />
                  Mark as Checkpoint
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddSectionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Section"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Block</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              addBlock({
                kind: formData.get("kind"),
                content: formData.get("content"),
                media_url: formData.get("media_url"),
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="block-kind">Block Type *</Label>
              <Select name="kind" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select block type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="block-content">Content</Label>
              <Textarea
                id="block-content"
                name="content"
                placeholder="Enter block content (or alt text for media)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-url">Media URL (for image/video blocks)</Label>
              <Input id="media-url" name="media_url" placeholder="https://example.com/image.jpg" />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddBlockOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Block"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={!!editingLesson} onOpenChange={() => setEditingLesson(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          {editingLesson && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                updateLessonHandler(editingLesson.id, {
                  title: formData.get("title"),
                  description: formData.get("description"),
                  type: formData.get("type"),
                  duration: Number.parseInt(formData.get("duration")) || null,
                  content: formData.get("content"),
                  videoUrl: formData.get("videoUrl"),
                })
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-title">Lesson Title *</Label>
                <Input id="edit-title" name="title" defaultValue={editingLesson.title} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Lesson Type *</Label>
                <Select name="type" defaultValue={editingLesson.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Text">Text</SelectItem>
                    <SelectItem value="Interactive">Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingLesson.summary || ""}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    name="duration"
                    type="number"
                    defaultValue={editingLesson.duration_seconds ? Math.round(editingLesson.duration_seconds / 60) : ""}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-videoUrl">Video URL</Label>
                  <Input id="edit-videoUrl" name="videoUrl" defaultValue={editingLesson.video_url || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Lesson Content</Label>
                <Textarea id="edit-content" name="content" defaultValue={editingLesson.content || ""} rows={4} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingLesson(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Lesson"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
