"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play } from "lucide-react";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { listUserCourses } from "@/lib/api/users";
import { getProgressSummary } from "@/lib/api/progress"; // ✅ use summary route

export function CourseGrid({ onCourseSelect }) {
  const { authorized, userId } = useSessionGuard("student", false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressMap, setProgressMap] = useState({}); // ✅ store per-course progress

  // ✅ Load active courses
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!authorized || !userId) return;
        const data = await listUserCourses(userId, {
          include: "deep",
          status: "active",
        });
        if (!alive) return;
        const courses = Array.isArray(data?.items) ? data.items : [];
        setItems(courses);
        setError(null);

        // Fetch progress summaries for each course
        const summaries = {};
        for (const c of courses) {
          if (!c.enrollment_id) continue;
          try {
            const s = await getProgressSummary({
              enrollmentId: c.enrollment_id,
              courseId: c.id,
            });
            summaries[c.id] = s?.courseProgress || 0;
          } catch (err) {
            summaries[c.id] = 0;
            console.warn("Progress summary failed for", c.id, err);
          }
        }
        setProgressMap(summaries);
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

  // 🏷️ Status badge logic (unchanged)
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

  // ✅ Dynamic progress calculation using progressMap
  const calcProgress = (course) => {
    return progressMap[course.id] || 0;
  };

  if (loading)
    return (
      <Card>
        <CardContent className="p-6 text-muted-foreground">
          Loading courses…
        </CardContent>
      </Card>
    );
  if (error)
    return (
      <Card>
        <CardContent className="p-6 text-destructive">{error}</CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((course) => {
            const progress = calcProgress(course);
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
                    <p className="text-sm text-muted-foreground">
                      {course.summary || "—"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                 <Button
                    size="sm"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const pointer = await getProgressPointer({
                          userId,
                          courseId: course.id,
                        });

                        onCourseSelect?.({
                          ...course,
                          resumeAt: pointer?.last_entity_id || null,
                          resumeType: pointer?.last_entity_type || null,
                        });
                      } catch {
                        onCourseSelect?.(course);
                      }
                    }}
                  >
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
