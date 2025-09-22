"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw, AlertTriangle } from "lucide-react"

export function QuizInterface({ quiz, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [quizState, setQuizState] = useState("start")
  const [score, setScore] = useState(0)

  const questions = [
    {
      id: 1,
      type: "single",
      question: "What is the primary benefit of component composition in React?",
      options: [
        "Better performance",
        "Code reusability and maintainability",
        "Smaller bundle size",
        "Faster rendering",
      ],
      correct: 1,
      explanation:
        "Component composition promotes code reusability and maintainability by allowing you to build complex UIs from simple, reusable components.",
    },
    {
      id: 2,
      type: "multiple",
      question: "Which of the following are valid ways to compose components? (Select all that apply)",
      options: ["Using props.children", "Render props pattern", "Higher-order components", "Direct DOM manipulation"],
      correct: [0, 1, 2],
      explanation:
        "Props.children, render props, and HOCs are all valid composition patterns. Direct DOM manipulation goes against React principles.",
    },
    {
      id: 3,
      type: "boolean",
      question: "Component composition can only be achieved through props.children.",
      correct: false,
      explanation:
        "Component composition can be achieved through multiple patterns including props.children, render props, HOCs, and more.",
    },
    {
      id: 4,
      type: "text",
      question: 'Explain in one sentence what makes a component "composable".',
      sampleAnswer:
        "A composable component is designed to work well with other components and can be easily combined to create more complex functionality.",
      explanation:
        "Composable components are designed with clear interfaces and single responsibilities, making them easy to combine and reuse.",
    },
    {
      id: 5,
      type: "single",
      question: "When should you prefer composition over inheritance in React?",
      options: [
        "Never, inheritance is always better",
        "Only for simple components",
        "Almost always, as React recommends composition",
        "Only when performance is critical",
      ],
      correct: 2,
      explanation:
        "React strongly recommends composition over inheritance for component reuse, as it provides more flexibility and clearer component relationships.",
    },
  ]

  useEffect(() => {
    if (quizState === "taking" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quizState === "taking") {
      handleSubmit()
    }
  }, [timeLeft, quizState])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    // Calculate score
    let correctAnswers = 0
    questions.forEach((q, index) => {
      const userAnswer = answers[q.id]
      if (q.type === "single" || q.type === "boolean") {
        if (userAnswer === q.correct) correctAnswers++
      } else if (q.type === "multiple") {
        const correct = Array.isArray(q.correct) ? q.correct.sort() : []
        const user = Array.isArray(userAnswer) ? userAnswer.sort() : []
        if (JSON.stringify(correct) === JSON.stringify(user)) correctAnswers++
      } else if (q.type === "text") {
        // For demo purposes, assume text answers are correct if they exist
        if (userAnswer && userAnswer.trim().length > 10) correctAnswers++
      }
    })

    const finalScore = Math.round((correctAnswers / questions.length) * 100)
    setScore(finalScore)
    setQuizState("results")
  }

  const renderQuestion = (question) => {
    const answer = answers[question.id]

    switch (question.type) {
      case "single":
        return (
          <RadioGroup
            value={answer?.toString()}
            onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`q${question.id}-${index}`} />
                <Label htmlFor={`q${question.id}-${index}`} className="text-pretty">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "multiple":
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`q${question.id}-${index}`}
                  checked={Array.isArray(answer) && answer.includes(index)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(answer) ? answer : []
                    if (checked) {
                      handleAnswerChange(question.id, [...currentAnswers, index])
                    } else {
                      handleAnswerChange(
                        question.id,
                        currentAnswers.filter((a) => a !== index),
                      )
                    }
                  }}
                />
                <Label htmlFor={`q${question.id}-${index}`} className="text-pretty">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "boolean":
        return (
          <RadioGroup
            value={answer?.toString()}
            onValueChange={(value) => handleAnswerChange(question.id, value === "true")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`q${question.id}-true`} />
              <Label htmlFor={`q${question.id}-true`}>True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`q${question.id}-false`} />
              <Label htmlFor={`q${question.id}-false`}>False</Label>
            </div>
          </RadioGroup>
        )

      case "text":
        return (
          <Textarea
            placeholder="Enter your answer here..."
            value={answer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="min-h-[100px]"
          />
        )

      default:
        return null
    }
  }

  if (quizState === "start") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-balance">{quiz.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold text-balance">Ready to start?</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Questions:</span>
                <span>{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Limit:</span>
                <span>{formatTime(timeLeft)}</span>
              </div>
              <div className="flex justify-between">
                <span>Attempts Left:</span>
                <span>2</span>
              </div>
              <div className="flex justify-between">
                <span>Pass Score:</span>
                <span>70%</span>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground text-pretty">
                <strong>Instructions:</strong> Answer all questions to the best of your ability. You can navigate
                between questions, but the timer will continue running.
              </p>
            </div>

            <Button className="w-full" onClick={() => setQuizState("taking")}>
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizState === "results") {
    const passed = score >= 70

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-balance">Quiz Results</h1>
                <p className="text-sm text-muted-foreground">{quiz.title}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Score Card */}
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    passed ? "bg-chart-1/10" : "bg-chart-5/10"
                  }`}
                >
                  {passed ? (
                    <CheckCircle className="w-8 h-8 text-chart-1" />
                  ) : (
                    <XCircle className="w-8 h-8 text-chart-5" />
                  )}
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-balance">{score}%</h2>
                  <p className={`text-lg font-medium ${passed ? "text-chart-1" : "text-chart-5"}`}>
                    {passed ? "Passed!" : "Failed"}
                  </p>
                </div>

                <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {questions.filter((_, i) => answers[questions[i].id] !== undefined).length}/{questions.length}{" "}
                    answered
                  </span>
                  <span>•</span>
                  <span>Pass score: 70%</span>
                </div>

                {!passed && (
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-chart-5 border-chart-5">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Retry available in 24h
                    </Badge>
                    <p className="text-sm text-muted-foreground">1 attempt remaining</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question Review */}
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Question Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, index) => {
                  const userAnswer = answers[question.id]
                  const isCorrect = (() => {
                    if (question.type === "single" || question.type === "boolean") {
                      return userAnswer === question.correct
                    } else if (question.type === "multiple") {
                      const correct = Array.isArray(question.correct) ? question.correct.sort() : []
                      const user = Array.isArray(userAnswer) ? userAnswer.sort() : []
                      return JSON.stringify(correct) === JSON.stringify(user)
                    } else if (question.type === "text") {
                      return userAnswer && userAnswer.trim().length > 10
                    }
                    return false
                  })()

                  return (
                    <div key={question.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-chart-1 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-chart-5 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-balance">
                            Question {index + 1}: {question.question}
                          </h4>

                          {question.explanation && (
                            <div className="mt-2 p-3 bg-muted rounded-lg">
                              <p className="text-sm text-pretty">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                Back to Course
              </Button>
              {!passed && (
                <Button disabled className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry (24h cooldown)
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Taking quiz state
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-balance">{quiz.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={timeLeft < 60 ? "text-chart-5 font-medium" : ""}>{formatTime(timeLeft)}</span>
              </div>
              {timeLeft < 60 && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Time running out!
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-2">
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-1" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">{questions[currentQuestion].question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestion(questions[currentQuestion])}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={handleSubmit}>Submit Quiz</Button>
                ) : (
                  <Button onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}>
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Navigation */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm text-balance">Question Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentQuestion === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestion(index)}
                    className={`relative ${
                      answers[questions[index].id] !== undefined ? "ring-2 ring-chart-1 ring-offset-2" : ""
                    }`}
                  >
                    {index + 1}
                    {answers[questions[index].id] !== undefined && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-chart-1 rounded-full" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
