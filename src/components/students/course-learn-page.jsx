"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Play, Clock, Target } from "lucide-react"
import { getQuizzesByLesson, getQuizzesByModule } from "@/lib/api/quizzes"
import {
  startProgress,
  completeProgress,
  recordQuizProgress,
} from "@/lib/api/progress";

import { getProgressSummary } from "@/lib/api/progress";


function BlockRenderer({ block }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="text-pretty">{block.content}</p>

    case "image":
      return (
        <figure className="my-3">
          <img src={block.media_url || "/placeholder.svg"} alt={block.content || "Image"} className="rounded-lg" />
          {block.content && <figcaption className="text-xs text-muted-foreground mt-1">{block.content}</figcaption>}
        </figure>
      )

    case "code":
      return (
        <pre className="p-3 rounded-lg bg-muted overflow-auto text-sm">
          <code>{block.content}</code>
        </pre>
      )

    case "quote":
      return (
        <blockquote className="border-l-4 pl-3 italic text-muted-foreground">
          {block.content}
        </blockquote>
      )

    case "list": {
      // simple split by newline; feel free to switch to JSON later
      const items = (block.content || "").split("\n").filter(Boolean)
      return (
        <ul className="list-disc ml-6 space-y-1">
          {items.map((li, i) => <li key={i}>{li}</li>)}
        </ul>
      )
    }

    case "callout":
      return (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          {block.content}
        </div>
      )

    default:
      return null
  }
}

export function CourseLearnPage({ course, onBack, onQuizStart, session }) {
const [lessonQuiz, setLessonQuiz] = useState(null);
const [courseProgress, setCourseProgress] = useState(0);
const [lessonsCompleted, setLessonsCompleted] = useState(0);
const [totalLessons, setTotalLessons] = useState(0);
const [quizzesPassed, setQuizzesPassed] = useState(0);
const [totalQuizzes, setTotalQuizzes] = useState(0);
const [progressMap, setProgressMap] = useState({});
const [showQuiz, setShowQuiz] = useState(false);

  // 1) Flatten real lessons
  const flatLessons = useMemo(() => {
    const out = [];
    for (const mod of course.modules || []) {
      for (const les of mod.lessons || []) {
        out.push({ ...les, _moduleTitle: mod.title, _moduleId: mod.id });
      }
    }
    return out.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [course]);

  const [currentIdx, setCurrentIdx] = useState(() => {
  if (course.resumeAt) {
    const index = flatLessons.findIndex(l => l.id === course.resumeAt);
    return index >= 0 ? index : 0;
  }
  return 0;
});

  const current = flatLessons[currentIdx] || null;
  // ✅ Detect if this is the last lesson in the current module
const isLastLessonInModule = useMemo(() => {
  if (!current || !current._moduleId) return false;
  const moduleLessons = flatLessons.filter(l => l._moduleId === current._moduleId);
  const sorted = moduleLessons.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return current.id === sorted[sorted.length - 1].id;
}, [current?.id, flatLessons]);


  // ✅ Start progress tracking when lesson opens
  useEffect(() => {
    if (!current?.id || !course?.enrollment_id) return;
    (async () => {
      try {
        await startProgress({
          userId: session?.user?.id || 1, // replace with your real user id
          enrollmentId: course.enrollment_id,
          entityType: "lesson",
          entityId: current.id,
          courseId: course.id,
          lastEntityType: "lesson",
          lastEntityId: current.id,
        });
        console.log("Lesson progress started:", current.id);
      } catch (err) {
        console.error("Failed to start progress:", err);
      }
    })();
  }, [current?.id, course?.enrollment_id, course?.id]);

  async function handleCompleteLesson() {
    try {
      await completeProgress({
        enrollmentId: course.enrollment_id,
        entityType: "lesson",
        entityId: current.id,
        secondsSpent: 600,
      });
      console.log("Lesson marked complete:", current.id);
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  }
  
 useEffect(() => {
   if (!current?.id) return
   async function loadQuiz() {
     try {
   
      // 1) Try lesson-scoped quiz
      const lessonList = await getQuizzesByLesson(current.id)
      if (Array.isArray(lessonList) && lessonList.length) {
        setLessonQuiz(lessonList[0])
        return
      }
      // 2) Fallback: module final (module-scoped)
      if (!current?._moduleId) {
        setLessonQuiz(null)
        return
      }
      const moduleList = await getQuizzesByModule(current._moduleId)
      const finalQuiz =
        (moduleList || []).find(q => q.scope === "module" && (q.is_final === 1 || q.is_final === true))
        || (moduleList || [])[0]
      setLessonQuiz(finalQuiz || null)
     } catch (err) {
       console.error("Failed to load lesson quiz:", err)
       setLessonQuiz(null)
     }
   }
   loadQuiz()
 }, [current])


// Fetch summary whenever course/enrollment changes or every 30s
useEffect(() => {
  if (!course?.enrollment_id) return;
  let active = true;

  async function loadSummary() {
    try {
      const data = await getProgressSummary({
        enrollmentId: course.enrollment_id,
        courseId: course.id,
      });
      if (!active) return;
   setCourseProgress(data.courseProgress || 0);
    setLessonsCompleted(data.lessonsCompleted || 0);
    setTotalLessons(data.totalLessons || 0);
    setQuizzesPassed(data.quizzesPassed || 0);
    setTotalQuizzes(data.totalQuizzes || 0);

// ✅ Optional: store per-lesson completion if route includes details
if (data.lessonDetails && Array.isArray(data.lessonDetails)) {
  const map = {};
  for (const l of data.lessonDetails) {
    map[l.entity_id] = l;
  }
  setProgressMap(map);
}

    } catch (err) {
      console.error("Failed to load progress summary:", err);
    }
  }

  loadSummary();
  const interval = setInterval(loadSummary, 30000); // refresh every 30s

  return () => {
    active = false;
    clearInterval(interval);
  };
}, [course?.enrollment_id, course?.id]);


  const goPrev = () => setCurrentIdx(i => Math.max(0, i - 1))
  const goNext = () => setCurrentIdx(i => Math.min(flatLessons.length - 1, i + 1))

  // 2) Compute simple syllabus data
  const syllabus = useMemo(() => {
    return (course.modules || [])
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map(m => ({
        id: m.id,
        title: m.title,
        lessons: (m.lessons || [])
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map(l => ({ id: l.id, title: l.title, duration_seconds: l.duration_seconds })),
        // you can wire a real finalQuiz later if/when it exists
        finalQuiz: null
      }))
  }, [course])


  // 4) Current lesson pieces
  const videoUrl = current?.video_url || "/placeholder.svg"
  const lessonSections = (current?.sections || []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  // Find quiz matching the current lesson


  async function handleSyllabusLessonComplete(lessonId) {
  try {
    await completeProgress({
      enrollmentId: course.enrollment_id,
      entityType: "lesson",
      entityId: lessonId,
      secondsSpent: 300, // or compute dynamically
    });
    console.log(`Lesson ${lessonId} marked complete`);

    // Refresh sidebar progress immediately after marking complete
    const data = await getProgressSummary({
      enrollmentId: course.enrollment_id,
      courseId: course.id,
    });
    setCourseProgress(data.courseProgress || 0);
    setLessonsCompleted(data.lessonsCompleted || 0);
    setTotalLessons(data.totalLessons || 0);
    setQuizzesPassed(data.quizzesPassed || 0);
    setTotalQuizzes(data.totalQuizzes || 0);
  } catch (err) {
    console.error("Error marking syllabus lesson complete:", err);
  }
}

useEffect(() => {
  if (lessonsCompleted >= totalLessons && lessonQuiz) {
    setShowQuiz(true);
    console.log("All lessons done — showing quiz.");
  }
}, [lessonsCompleted, totalLessons, lessonQuiz]);


 

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-balance">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {current ? `Module: ${current._moduleTitle}` : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={goPrev} disabled={currentIdx <= 0}>
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button variant="ghost" size="sm" onClick={goNext} disabled={currentIdx >= flatLessons.length - 1}>
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Syllabus Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg text-balance">Course Syllabus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {syllabus.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <h4 className="font-medium text-sm text-balance">{module.title}</h4>
                    <div className="space-y-1 ml-2">
                    {module.lessons.map((lesson) => {
                      const idx = flatLessons.findIndex((l) => l.id === lesson.id);
                      const isActive = idx === currentIdx;
                      const isCompleted =
                        progressMap[lesson.id]?.status === "completed" ||
                        (lesson.status && lesson.status === "completed");

                      return (
                        <div key={lesson.id} className="flex items-center justify-between gap-2">
                          <button
                            className={`flex-1 flex items-center gap-2 text-sm p-1 rounded hover:bg-muted/50 text-left ${
                              isActive ? "bg-muted/50" : ""
                            }`}
                            onClick={() => setCurrentIdx(idx >= 0 ? idx : 0)}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                isCompleted
                                  ? "bg-green-500 border-green-500"
                                  : "border-muted"
                              }`}
                            />
                            <span
                              className={isActive ? "text-foreground" : "text-muted-foreground"}
                            >
                              {lesson.title}
                            </span>
                            {lesson.duration_seconds ? (
                              <Clock className="w-3 h-3 text-muted-foreground ml-auto" />
                            ) : null}
                          </button>

                          {/* ✅ Mark Complete Button (check icon) */}
                          <button
                            title="Mark as Complete"
                            onClick={() => handleSyllabusLessonComplete(lesson.id)}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                      {module.finalQuiz && (
                        <div className="flex items-center gap-2 text-sm p-1 rounded hover:bg-muted/50 cursor-pointer mt-2 border-t pt-2">
                          <div className="w-4 h-4 border-2 border-muted rounded-full opacity-50" />
                          <span className="font-medium text-chart-4">{module.finalQuiz.title}</span>
                          <Target className="w-3 h-3 text-chart-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">{current?.title || "Select a lesson"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Player / Poster */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <img
                    src={videoUrl}
                    alt="Lesson video"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Lesson summary/content field (if you want it above sections) */}
                {current?.summary && (
                  <p className="text-sm text-muted-foreground">{current.summary}</p>
                )}

                {/* Sections + Blocks */}
                {lessonSections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h4 className="font-semibold text-balance">{section.title}</h4>
                    {section.body && <p className="text-pretty">{section.body}</p>}

                    <div className="space-y-3">
                      {(section.blocks || [])
                        .slice()
                        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                        .map((block) => (
                          <BlockRenderer key={block.id} block={block} />
                        ))}
                    </div>

                    {/* (Optional) Show checkpoint marker */}
                    {section.is_checkpoint ? (
                      <div className="flex items-center gap-2 text-xs text-chart-2">
                        <CheckCircle className="w-4 h-4" /> Checkpoint
                      </div>
                    ) : null}
                  </div>
                ))}

                {/* (Optional) Mark-as-complete button per section/lesson can call your progress API */}
                
                <Button className="w-full" onClick={handleCompleteLesson}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>

              </CardContent>
            </Card>

            {/* Lesson Quiz (placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Lesson Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground text-pretty">
                    Ready to test your understanding?
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>—</span><span>•</span><span>—</span><span>•</span><span>—</span>
                  </div>
              <CardContent>
              {isLastLessonInModule ? (
                <Button
                  onClick={() =>
                    onQuizStart?.({
                      id: lessonQuiz?.id,
                      title: lessonQuiz?.title || `${current?.title || "Lesson"} Quiz`,
                      type: "lesson-quiz",
                    })
                  }
                  disabled={!lessonQuiz}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete all lessons in this module to unlock the final quiz.
                </p>
              )}
            </CardContent>


                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg text-balance">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{courseProgress}%</span>
                  </div>
                  <Progress value={courseProgress} className="h-2" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lessons Completed</span>
                    <span>{lessonsCompleted}/{totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quizzes Passed</span>
                    <span>{quizzesPassed}/{course.totalQuizzes ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Threshold</span>
                    <span>{course.pass_threshold ?? 70}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 text-balance">Requirements</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Complete all lessons</li>
                    <li>• Pass all quizzes ≥ {course.pass_threshold ?? 70}%</li>
                    <li>• Pass all module finals</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
