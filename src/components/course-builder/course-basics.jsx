"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save, Upload } from "lucide-react"
import { createCourse, updateCourse } from "@/lib/api/courses"   // ✅ use your central API client
import { toast } from "sonner"


export function CourseBasics({ course, onUpdate, onSave, instructors = [], categories = [] }) {
  const searchParams = useSearchParams()
  const editingCourseId = searchParams.get("courseId")
  // Local editing buffer
  const [localCourse, setLocalCourse] = useState(() => ({
    id: course?.id ?? Date.now(),
    title: course?.title ?? "",
    summary: course?.summary ?? "",
    description: course?.description ?? "",
    longDescription: course?.longDescription ?? "",
    category: course?.category ?? "", // category name
    level: course?.level ?? "beginner",
    estimatedHours: Number.isFinite(course?.estimatedHours) ? course.estimatedHours : 0,
    price: typeof course?.price === "number" ? course.price : Number(course?.price || 0),
    passThreshold: Number.isFinite(course?.passThreshold) ? course.passThreshold : 70,
      instructorId: course?.instructorId ? String(course.instructorId) : "",
    instructorName: course?.instructorName ?? "",
    coverImage: course?.coverImage ?? course?.cover_image_url ?? "",
    visibility: course?.visibility ?? (course?.is_published ? "published" : "draft"),
    tags: Array.isArray(course?.tags) ? course.tags : [],
    // modules/lessons/quizzes are handled by other sections
  }))

  // Keep in sync when parent updates course (e.g., when loading from API)
  useEffect(() => {
    if (!course) return
    setLocalCourse((prev) => ({
      ...prev,
      id: course.id ?? prev.id,
      title: course.title ?? "",
      summary: course.summary ?? "",
      description: course.description ?? "",
      longDescription: course.longDescription ?? "",
      category: course.category ?? "",
      level: course.level ?? "beginner",
      estimatedHours: Number.isFinite(course.estimatedHours) ? course.estimatedHours : (prev.estimatedHours ?? 0),
      price: typeof course.price === "number" ? course.price : Number(course.price || 0),
      passThreshold: Number.isFinite(course.passThreshold) ? course.passThreshold : (prev.passThreshold ?? 70),
      instructorId:
        course.instructorId != null && course.instructorId !== ""
          ? String(course.instructorId)
          : prev.instructorId,
      instructorName:
        course.instructorName != null && course.instructorName !== ""
          ? course.instructorName
          : prev.instructorName,
      coverImage: course.coverImage ?? course.cover_image_url ?? "",
      visibility: course.visibility ?? (course.is_published ? "published" : prev.visibility ?? "draft"),
      tags: Array.isArray(course.tags) ? course.tags : [],
    }))
  }, [course])


function toDbPayload(c) {
  const category =
    categories.find((cat) => (cat.name || "").toLowerCase() === (c.category || "").toLowerCase()) ||
    categories.find((cat) => String(cat.id) === String(c.category)) ||
    null

  return {
    title: c.title?.trim() || "",
    summary: c.summary || "",
    cover_image_url: c.coverImage || "",
    category_id: category ? Number(category.id) : null,
    estimated_duration_minutes: Number(c.estimatedHours || 0) * 60,
    price: Number.isFinite(c.price) ? Number(c.price) : 0,
    currency: c.currency || "USD",
    primary_instructor_id: c.instructorId ? Number(c.instructorId) : null, // Ensure conversion to number
    is_published: c.visibility === "published" ? 1 : 0,
    pass_threshold: Number.isFinite(c.passThreshold) ? Number(c.passThreshold) : 70,
  }
}

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

    
async function handleSaveClick() {
  setSaveError(null)
  setSaving(true)
  try {
    const payload = toDbPayload(localCourse)

    // Prefer id from URL; if absent, use the current course.id when valid
    const effectiveId =
      editingCourseId ||
      (Number.isFinite(Number(course?.id)) ? String(course.id) : null)

    if (effectiveId) {
      // ✅ EDIT MODE → PATCH existing course
      const updated = await updateCourse(effectiveId, payload)
      const merged = { ...localCourse, id: Number(effectiveId) }
      onSave && onSave(merged)
      console.log("✅ Course updated:", updated)
       toast.success("Course updated", { description: "Your changes have been saved." })
      return updated
    } else {
      // ✅ CREATE MODE → POST new course
      const created = await createCourse(payload)
      const newId = created?.id ?? localCourse.id
      const merged = { ...localCourse, id: newId }
      onSave && onSave(merged)
      console.log("✅ Course created:", created)
      toast.success("Course created", { description: "A new course has been added." })
      return created
    }
  } catch (e) {
    console.error("❌ Save failed:", e)
    setSaveError(e?.message || "Failed to save course")
     toast.error("Save failed", { description: e?.message || "Something went wrong while saving." })
    return null
  } finally {
    setSaving(false)
  }
}


  const commit = (updated) => {
    setLocalCourse(updated)
    onUpdate && onUpdate(updated)
  }

  const handleChange = (field, value) => {
    commit({ ...localCourse, [field]: value })
  }

  const handleTagAdd = (tag) => {
    const t = tag?.trim()
    if (!t) return
    if (localCourse.tags?.includes(t)) return
    handleChange("tags", [...(localCourse.tags || []), t])
  }

  const handleTagRemove = (tagToRemove) => {
    handleChange("tags", (localCourse.tags || []).filter((t) => t !== tagToRemove))
  }
  async function uploadImageToServer(file, bucket = "course-images") {
  const formData = new FormData();
  formData.append("bucket", bucket);
  formData.append("image", file);

  const response = await fetch("https://image-url.onrender.com/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error("Image upload failed");
  }

  return result.url; // this is the public image URL
}


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Basics</h2>
          <p className="text-muted-foreground">Set up the fundamental information for your course</p>
        </div>
       <Button onClick={handleSaveClick} disabled={saving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
           {saving ? "Saving..." : "Save"}
        </Button>
      </div>
       {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={localCourse.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter course title (5–120 chars)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Short Summary</Label>
                <Textarea
                  id="summary"
                  value={localCourse.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
                  placeholder="Brief description for course cards (max 200 chars)"
                  rows={2}
                />
              </div>

            
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/*     <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                <Select
                value={localCourse.instructorId || ""}
                onValueChange={(value) => {
                  const found = instructors.find((i) => String(i.id) === value)
                  handleChange("instructorId", value)                 // keep as string
                  handleChange("instructorName", found?.name || "")
                }}
              >
                    <SelectTrigger>
                       <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                     {instructors.map((i) => (
      <SelectItem key={i.id} value={String(i.id)}>
        {i.name}
      </SelectItem>
    ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={localCourse.category || ""}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>*/}

               
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={Number.isFinite(localCourse.estimatedHours) ? localCourse.estimatedHours : 0}
                    onChange={(e) => handleChange("estimatedHours", parseInt(e.target.value || "0", 10))}
                    placeholder="8"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={typeof localCourse.price === "number" ? localCourse.price : Number(localCourse.price || 0)}
                    onChange={(e) => handleChange("price", parseFloat(e.target.value || "0"))}
                    placeholder="99.99"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passThreshold">Pass Threshold (%)</Label>
                  <Input
                    id="passThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={Number.isFinite(localCourse.passThreshold) ? localCourse.passThreshold : 70}
                    onChange={(e) => handleChange("passThreshold", parseInt(e.target.value || "70", 10))}
                  />
                </div>
              </div>

             
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localCourse.coverImage ? (
                  <div className="relative">
                    <img
                      src={localCourse.coverImage || "/placeholder.svg"}
                      alt="Course cover"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => handleChange("coverImage", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload course image</p>
                  </div>
                )}
               <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";

                    input.onchange = async () => {
                      const file = input.files?.[0];
                      if (!file) return;

                      try {
                        const url = await uploadImageToServer(file);
                        handleChange("coverImage", url); // ✅ updates the image field
                      } catch (err) {
                        console.error("Image upload failed:", err);
                        alert("Failed to upload image");
                      }
                    };

                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>

              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={localCourse.visibility || "draft"}
                  onValueChange={(value) => handleChange("visibility", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Status:</span>
                  <Badge variant={localCourse.visibility === "published" ? "default" : "secondary"}>
                    {localCourse.visibility || "draft"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CourseBasics
