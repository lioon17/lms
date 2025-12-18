"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play } from "lucide-react";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { listUserCourses } from "@/lib/api/users";
import { getProgressSummary } from "@/lib/api/progress";

export function CourseGrid({ onCourseSelect }) {
  const { authorized, userId } = useSessionGuard("student", false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // courseId -> summary object
  const [summaryMap, setSummaryMap] = useState({});

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!authorized || !userId) return;

        const data = await listUserCourses(userId, { include: "deep", status: "active" });
        if (!alive) return;

        const courses = Array.isArray(data?.items) ? data.items : [];
        setItems(courses);
        setError(null);

        const summaries = {};
        for (const c of courses) {
          if (!c.enrollment_id) continue;

          try {
            // NOTE: your summary route only needs enrollmentId
            const s = await getProgressSummary({ enrollmentId: c.enrollment_id });
            summaries[c.id] = s || null;
          } catch (err) {
            summaries[c.id] = null;
            console.warn("Progress summary failed for", c.id, err);
          }
        }

        setSummaryMap(summaries);
      } catch (e) {
        if (alive) setError(e.message || "Failed to load courses");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [authorized, userId]);

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return <Badge className="bg-chart-1 text-white">Completed</Badge>;
      case "active":
        return <Badge variant="secondary">In Progress</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "suspended":
        return <Badge variant="outline">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status || "—"}</Badge>;
    }
  };

  // Always return a NUMBER for rendering
  const getCourseProgressPct = (course) => {
    const s = summaryMap[course.id];
    return typeof s?.courseProgress === "number" ? s.courseProgress : 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-muted-foreground">Loading courses…</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-destructive">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((course) => {
            const progress = getCourseProgressPct(course);
            const s = summaryMap[course.id];

            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={course.cover_image_url || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(course.enrollment_status)}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-balance">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.summary || "—"}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />

                    {/* optional details */}
                    <div className="text-xs text-muted-foreground">
                      {(s?.lessonsCompleted ?? 0)}/{(s?.totalLessons ?? 0)} lessons ·{" "}
                      {(s?.quizzesPassed ?? 0)}/{(s?.totalQuizzes ?? 0)} quizzes
                    </div>
                  </div>

                  <Button size="sm" className="w-full" onClick={() => onCourseSelect?.(course)}>
                    <Play className="w-4 h-4 mr-2" /> Continue
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
