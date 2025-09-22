"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Plus,
  GripVertical,
  Edit,
  Trash2,
  Copy,
  BookOpen,
  FileQuestion,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react"
import { createModule, updateModule, deleteModule, reorderModules, getModulesByCourseId } from "@/lib/api/modules"

export function CourseModules({ course, onUpdate, onSave }) {
  const [modules, setModules] = useState([])
  const [expandedModules, setExpandedModules] = useState(new Set())
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load modules when course ID changes
  useEffect(() => {
    const loadModules = async () => {
      if (course.id) {
        setIsLoading(true)
        setError(null)
        try {
          const modulesData = await getModulesByCourseId(course.id)
          setModules(modulesData)
          // Notify parent about the loaded modules
          onUpdate({ ...course, modules: modulesData })
        } catch (err) {
          setError(err.message || "Failed to load modules")
          console.error("Error loading modules:", err)
        } finally {
          setIsLoading(false)
        }
      } else {
        // If no course ID (new course), start with empty array
        setModules([])
      }
    }

    loadModules()
  }, [course.id])

  const handleModulesUpdate = (newModules) => {
    setModules(newModules)
    onUpdate({ ...course, modules: newModules })
  }

  const addModule = async (title, summary) => {
    setIsSaving(true)
    setError(null)
    try {
      const newModule = await createModule(course.id, title, summary)
      handleModulesUpdate([...modules, newModule])
      setIsAddModuleOpen(false)
    } catch (err) {
      setError(err.message || "Failed to create module")
      console.error("Error creating module:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const updateModuleHandler = async (moduleId, updates) => {
    setIsSaving(true)
    setError(null)
    try {
      await updateModule(moduleId, updates)
      const updatedModules = modules.map((module) => (module.id === moduleId ? { ...module, ...updates } : module))
      handleModulesUpdate(updatedModules)
      setEditingModule(null)
    } catch (err) {
      setError(err.message || "Failed to update module")
      console.error("Error updating module:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteModuleHandler = async (moduleId) => {
    if (!confirm("Are you sure you want to delete this module?")) return

    setIsSaving(true)
    setError(null)
    try {
      await deleteModule(moduleId)
      const updatedModules = modules
        .filter((module) => module.id !== moduleId)
        .map((module, index) => ({ ...module, position: index }))
      handleModulesUpdate(updatedModules)
    } catch (err) {
      setError(err.message || "Failed to delete module")
      console.error("Error deleting module:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const duplicateModule = async (moduleId) => {
    setIsSaving(true)
    setError(null)
    try {
      const moduleToClone = modules.find((m) => m.id === moduleId)
      if (moduleToClone) {
        const newModule = await createModule(course.id, `${moduleToClone.title} (Copy)`, moduleToClone.summary)
        handleModulesUpdate([...modules, newModule])
      }
    } catch (err) {
      setError(err.message || "Failed to duplicate module")
      console.error("Error duplicating module:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveOrder = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const order = modules.map((module, index) => ({
        id: module.id,
        position: index,
      }))

      await reorderModules(course.id, order)
      onSave() // Notify parent that save was successful
    } catch (err) {
      setError(err.message || "Failed to save module order")
      console.error("Error reordering modules:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleModuleExpansion = (moduleId) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const calculateModuleStats = (module) => {
    const lessonCount = module.lessons?.length || 0
    const quizCount = module.quizzes?.length || 0
    const estimatedTime = (module.lessons || []).reduce((total, lesson) => total + (lesson.duration || 0), 0)

    return { lessonCount, quizCount, estimatedTime }
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Modules</h2>
          <p className="text-muted-foreground">Organize your course content into structured modules</p>
        </div>
        <div className="flex gap-2">
          {/*  <Button 
            onClick={handleSaveOrder} 
            variant="outline" 
            className="flex items-center gap-2 bg-transparent"
            disabled={isSaving || isLoading}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button> */}
          <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={isLoading}>
                <Plus className="h-4 w-4" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Module</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  addModule(formData.get("title"), formData.get("summary"))
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Module Title *</Label>
                  <Input id="title" name="title" placeholder="Enter module title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary (Optional)</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    placeholder="Brief description of what this module covers"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddModuleOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Adding..." : "Add Module"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading modules...</p>
          </CardContent>
        </Card>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your course by adding your first module
            </p>
            <Button onClick={() => setIsAddModuleOpen(true)} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module, index) => {
            const { lessonCount, quizCount, estimatedTime } = calculateModuleStats(module)
            const isExpanded = expandedModules.has(module.id)

            return (
              <Card key={module.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleModuleExpansion(module.id)}
                      className="p-0 h-auto"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Module {index + 1}
                        </Badge>
                        <h3 className="font-semibold">{module.title}</h3>
                      </div>
                      {module.summary && <p className="text-sm text-muted-foreground">{module.summary}</p>}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{lessonCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        <span>{quizCount}</span>
                      </div>
                      {estimatedTime > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>~{estimatedTime}m</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditingModule(module)} disabled={isSaving}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => duplicateModule(module.id)} disabled={isSaving}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteModuleHandler(module.id)}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Rest of the module content remains the same */}
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          {editingModule && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                updateModuleHandler(editingModule.id, {
                  title: formData.get("title"),
                  summary: formData.get("summary"),
                })
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-title">Module Title *</Label>
                <Input id="edit-title" name="title" defaultValue={editingModule.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-summary">Summary</Label>
                <Textarea id="edit-summary" name="summary" defaultValue={editingModule.summary || ""} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingModule(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Updating..." : "Update Module"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}