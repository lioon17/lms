// Mock data for demonstration
export const mockCourses = [
  {
    id: "1",
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of HTML, CSS, and JavaScript",
    instructorId: "2",
    instructorName: "John Instructor",
    category: "Programming",
    level: "beginner",
    duration: 480, // 8 hours
    price: 99.99,
    isPublished: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Advanced React Development",
    description: "Master React hooks, context, and advanced patterns",
    instructorId: "2",
    instructorName: "John Instructor",
    category: "Programming",
    level: "advanced",
    duration: 720, // 12 hours
    price: 149.99,
    isPublished: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-15"),
  },
]

export const mockModules = [
  {
    id: "1",
    courseId: "1",
    title: "HTML Fundamentals",
    description: "Learn the basics of HTML structure and elements",
    order: 1,
    isPublished: true,
  },
  {
    id: "2",
    courseId: "1",
    title: "CSS Styling",
    description: "Master CSS for beautiful web designs",
    order: 2,
    isPublished: true,
  },
  {
    id: "3",
    courseId: "1",
    title: "JavaScript Basics",
    description: "Introduction to JavaScript programming",
    order: 3,
    isPublished: true,
  },
]

export const mockLessons = [
  {
    id: "1",
    moduleId: "1",
    title: "HTML Document Structure",
    content: "Learn about the basic structure of an HTML document...",
    type: "video",
    videoUrl: "/placeholder.mp4",
    duration: 15,
    order: 1,
    isPublished: true,
  },
  {
    id: "2",
    moduleId: "1",
    title: "HTML Elements and Tags",
    content: "Understanding different HTML elements and their usage...",
    type: "video",
    videoUrl: "/placeholder.mp4",
    duration: 20,
    order: 2,
    isPublished: true,
  },
]

const sampleQuestions = [
  {
    id: "1",
    question: "What does HTML stand for?",
    type: "multiple-choice",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink and Text Markup Language",
    ],
    correctAnswer: "Hyper Text Markup Language",
    explanation:
      "HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages.",
    points: 10,
  },
  {
    id: "2",
    question: "CSS is used for styling web pages.",
    type: "true-false",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "CSS (Cascading Style Sheets) is indeed used for styling and formatting web pages.",
    points: 5,
  },
]

export const mockQuizzes = [
  {
    id: "1",
    courseId: "1",
    moduleId: "1",
    title: "HTML Fundamentals Quiz",
    description: "Test your knowledge of HTML basics",
    questions: sampleQuestions,
    passingScore: 70,
    timeLimit: 30,
    attempts: 3,
    isPublished: true,
  },
]

export const mockEnrollments = [
  {
    id: "1",
    userId: "3",
    courseId: "1",
    enrolledAt: new Date("2024-01-10"),
    progress: 45,
    status: "active",
  },
]

export const mockProgress = [
  {
    id: "1",
    userId: "3",
    courseId: "1",
    lessonId: "1",
    completed: true,
    completedAt: new Date("2024-01-11"),
    timeSpent: 15,
  },
]

export const mockCertificates = [
  {
    id: "cert-1",
    userId: "3",
    courseId: "1",
    issuedAt: new Date("2024-01-20"),
    certificateUrl: "/certificate/cert-1",
  },
]

// Utility functions for data management
export class DataStore {
  static getCourses() {
    const stored = localStorage.getItem("lms_courses")
    return stored ? JSON.parse(stored) : mockCourses
  }

  static saveCourses(courses) {
    localStorage.setItem("lms_courses", JSON.stringify(courses))
  }

  static getModules(courseId) {
    const stored = localStorage.getItem("lms_modules")
    const modules = stored ? JSON.parse(stored) : mockModules
    return courseId ? modules.filter((m) => m.courseId === courseId) : modules
  }

  static saveModules(modules) {
    localStorage.setItem("lms_modules", JSON.stringify(modules))
  }

  static getLessons(moduleId) {
    const stored = localStorage.getItem("lms_lessons")
    const lessons = stored ? JSON.parse(stored) : mockLessons
    return moduleId ? lessons.filter((l) => l.moduleId === moduleId) : lessons
  }

  static saveLessons(lessons) {
    localStorage.setItem("lms_lessons", JSON.stringify(lessons))
  }

  static getEnrollments(userId) {
    const stored = localStorage.getItem("lms_enrollments")
    const enrollments = stored ? JSON.parse(stored) : mockEnrollments
    return userId ? enrollments.filter((e) => e.userId === userId) : enrollments
  }

  static saveEnrollments(enrollments) {
    localStorage.setItem("lms_enrollments", JSON.stringify(enrollments))
  }

  static getQuizzes(courseId) {
    const stored = localStorage.getItem("lms_quizzes")
    const quizzes = stored ? JSON.parse(stored) : mockQuizzes
    return courseId ? quizzes.filter((q) => q.courseId === courseId) : quizzes
  }

  static saveQuizzes(quizzes) {
    localStorage.setItem("lms_quizzes", JSON.stringify(quizzes))
  }

  static getQuizAttempts(userId, quizId) {
    const stored = localStorage.getItem("lms_quiz_attempts")
    let attempts = stored ? JSON.parse(stored) : []

    if (userId) {
      attempts = attempts.filter((a) => a.userId === userId)
    }
    if (quizId) {
      attempts = attempts.filter((a) => a.quizId === quizId)
    }

    return attempts
  }

  static saveQuizAttempts(attempts) {
    localStorage.setItem("lms_quiz_attempts", JSON.stringify(attempts))
  }

  static getCertificates(userId) {
    const stored = localStorage.getItem("lms_certificates")
    const certificates = stored ? JSON.parse(stored) : mockCertificates
    return userId ? certificates.filter((c) => c.userId === userId) : certificates
  }

  static saveCertificates(certificates) {
    localStorage.setItem("lms_certificates", JSON.stringify(certificates))
  }

  static generateCertificate(userId, courseId) {
    const certificates = this.getCertificates()
    const newCertificate = {
      id: `cert-${Date.now()}`,
      userId,
      courseId,
      issuedAt: new Date(),
      certificateUrl: `/certificate/cert-${Date.now()}`,
    }

    certificates.push(newCertificate)
    this.saveCertificates(certificates)
    return newCertificate
  }

  static checkCourseCompletion(userId, courseId) {
    const enrollments = this.getEnrollments(userId)
    const enrollment = enrollments.find((e) => e.courseId === courseId)
    return enrollment?.status === "completed" && enrollment.progress === 100
  }
}

if (typeof window !== "undefined") {
  if (!localStorage.getItem("lms_quizzes")) {
    localStorage.setItem("lms_quizzes", JSON.stringify(mockQuizzes))
  }
  if (!localStorage.getItem("lms_quiz_attempts")) {
    localStorage.setItem("lms_quiz_attempts", JSON.stringify([]))
  }
  if (!localStorage.getItem("lms_certificates")) {
    localStorage.setItem("lms_certificates", JSON.stringify(mockCertificates))
  }
}
export const mockUsers = {
  admin:    { id: "1", name: "Alice Admin", role: "admin" },
  instructor:{ id: "2", name: "Ian Instructor", role: "instructor" },
  student:  { id: "3", name: "Sam Student", role: "student" },
};