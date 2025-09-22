"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  Users,
  BookOpen,
  Award,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Star,
  Download,
} from "lucide-react"

// Mock data for demonstration
const kpiData = {
  activeUsers: 2847,
  totalEnrollments: 15632,
  completionRate: 78.5,
  certificatesIssued: 1234,
  revenue: 89750,
  avgTimePerLesson: 24.5,
}

const enrollmentTrend = [
  { month: "Jan", enrollments: 1200, completions: 890 },
  { month: "Feb", enrollments: 1450, completions: 1120 },
  { month: "Mar", enrollments: 1680, completions: 1340 },
  { month: "Apr", enrollments: 1890, completions: 1456 },
  { month: "May", enrollments: 2100, completions: 1678 },
  { month: "Jun", enrollments: 2340, completions: 1890 },
]

const studentProgress = [
  { name: "Sarah Johnson", course: "React Fundamentals", progress: 95, status: "excelling", timeSpent: 45 },
  { name: "Mike Chen", course: "Node.js Backend", progress: 23, status: "behind", timeSpent: 12 },
  { name: "Emma Davis", course: "UI/UX Design", progress: 78, status: "on-track", timeSpent: 32 },
  { name: "Alex Rodriguez", course: "Python Basics", progress: 89, status: "excelling", timeSpent: 38 },
  { name: "Lisa Wang", course: "Data Science", progress: 34, status: "behind", timeSpent: 18 },
]

const quizPerformance = [
  { question: "React Hooks Basics", attempts: 245, passes: 189, avgScore: 76 },
  { question: "JavaScript Closures", attempts: 198, passes: 134, avgScore: 68 },
  { question: "CSS Grid Layout", attempts: 167, passes: 145, avgScore: 82 },
  { question: "API Integration", attempts: 223, passes: 156, avgScore: 71 },
  { question: "Database Queries", attempts: 189, passes: 98, avgScore: 58 },
]

const revenueData = [
  { name: "Course Sales", value: 65400, color: "hsl(var(--chart-1))" },
  { name: "Subscriptions", value: 18900, color: "hsl(var(--chart-2))" },
  { name: "Certificates", value: 5450, color: "hsl(var(--chart-3))" },
]

const topCourses = [
  { name: "Complete React Developer", sales: 1234, revenue: 24680 },
  { name: "Node.js Masterclass", sales: 987, revenue: 19740 },
  { name: "Python for Beginners", sales: 856, revenue: 17120 },
  { name: "UI/UX Design Bootcamp", sales: 743, revenue: 14860 },
  { name: "Data Science Fundamentals", sales: 621, revenue: 12420 },
]

export function LMSOverview() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Learning Management Overview</h1>
          <p className="text-muted-foreground">Comprehensive analytics and performance insights</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalEnrollments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.certificatesIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiData.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18.7%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time/Lesson</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgTimePerLesson}m</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-3.2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Section */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance Tracking</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="quiz-analytics">Quiz Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Enrollment Trends */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Enrollment & Completion Trends</CardTitle>
                <CardDescription>Monthly enrollment and completion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="enrollments"
                      stackId="1"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="completions"
                      stackId="2"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Progress Heatmap */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Student Progress Heatmap</CardTitle>
                <CardDescription>Track who's excelling and who needs support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentProgress.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{student.name}</span>
                          <Badge
                            variant={
                              student.status === "excelling"
                                ? "default"
                                : student.status === "behind"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {student.status === "excelling" && <Star className="h-3 w-3 mr-1" />}
                            {student.status === "behind" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {student.status === "on-track" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {student.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{student.course}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1">
                            <Progress value={student.progress} className="h-2" />
                          </div>
                          <span className="text-sm font-medium">{student.progress}%</span>
                          <span className="text-xs text-muted-foreground">{student.timeSpent}h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Module Completion Rates</CardTitle>
                <CardDescription>Completion rates by course module</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { module: "Intro", rate: 95 },
                      { module: "Basics", rate: 87 },
                      { module: "Intermediate", rate: 72 },
                      { module: "Advanced", rate: 58 },
                      { module: "Projects", rate: 45 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Spent Per Lesson</CardTitle>
                <CardDescription>Average engagement time by lesson type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { type: "Video", time: 28 },
                      { type: "Reading", time: 15 },
                      { type: "Quiz", time: 12 },
                      { type: "Project", time: 45 },
                      { type: "Discussion", time: 8 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="time" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quiz-analytics" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance Reports</CardTitle>
                <CardDescription>Detailed analysis of quiz attempts and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizPerformance.map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <h4 className="font-medium">{quiz.question}</h4>
                        <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                          <span>Attempts: {quiz.attempts}</span>
                          <span>Passes: {quiz.passes}</span>
                          <span>Success Rate: {Math.round((quiz.passes / quiz.attempts) * 100)}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{quiz.avgScore}%</div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attempts vs Passes Analysis</CardTitle>
                <CardDescription>Understanding redo frequency and difficulty patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quizPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attempts" fill="hsl(var(--chart-3))" name="Attempts" />
                    <Bar dataKey="passes" fill="hsl(var(--chart-1))" name="Passes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue distribution by source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top-Selling Courses</CardTitle>
                <CardDescription>Best performing courses by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{course.name}</h4>
                        <p className="text-sm text-muted-foreground">{course.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${course.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Pending Instructor Payouts</CardTitle>
                <CardDescription>Revenue sharing and instructor compensation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { instructor: "Dr. Sarah Wilson", courses: 3, earnings: 4250, status: "pending" },
                    { instructor: "Mark Thompson", courses: 2, earnings: 3180, status: "pending" },
                    { instructor: "Lisa Chen", courses: 4, earnings: 5670, status: "processed" },
                    { instructor: "David Rodriguez", courses: 1, earnings: 1890, status: "pending" },
                  ].map((payout, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{payout.instructor}</h4>
                        <p className="text-sm text-muted-foreground">{payout.courses} courses</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold">${payout.earnings.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Earnings</div>
                        </div>
                        <Badge variant={payout.status === "pending" ? "secondary" : "default"}>{payout.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
