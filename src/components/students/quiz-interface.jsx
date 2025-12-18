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
import { startQuiz, submitAttempt } from "@/lib/api/quizzes";
import {
  startProgress,
  completeProgress,
  recordQuizProgress,
} from "@/lib/api/progress";


export function QuizInterface({ quiz, enrollmentId, onBack }) {
  console.log("🟩 Received quiz prop:", quiz);
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [quizState, setQuizState] = useState("start")
  const [score, setScore] = useState(0)
  const [attemptId, setAttemptId] = useState(null);
  const [resultDetails, setResultDetails] = useState([]);



    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [error, setError] = useState(null);
  const [initialTimeLimit, setInitialTimeLimit] = useState(600);
 
  const handleStart = async () => {
  if (loading) return; // prevent double click
  try {
    setLoading(true);
    setError(null);

    // accept id, quiz_id, or slug (string/number)
    const idOrSlug = quiz?.id ?? quiz?.quiz_id ?? quiz?.slug;
    if (!idOrSlug) {
      throw new Error("No quiz identifier found (expected id, quiz_id, or slug).");
    }

    console.log("▶️ Starting quiz with:", idOrSlug);

    const payload = await startQuiz(idOrSlug); // POST /api/quizzes/:idOrSlug/start
    console.log("✅ Start payload:", payload);

    setAttemptId(payload.attempt_id);

    if (typeof payload.time_limit_seconds === "number") {
      setTimeLeft(payload.time_limit_seconds);
       setInitialTimeLimit(payload.time_limit_seconds); 
    }

    const normalized = (payload.questions || []).map((q) => ({
      id: q.id,
      type: mapQuestionType(q.type || q.question_type),
      question: q.question,
      options: (q.options || []).map(o => ({ id: o.id, text: o.text }))
    }));

    setQuestions(normalized);
    setQuizState("taking");
  } catch (e) {
    console.error("Start quiz failed:", e);
    setError(e?.message || "Failed to start quiz");
  } finally {
    setLoading(false);
  }
};




  useEffect(() => {
    if (quizState === "taking" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quizState === "taking") {
      handleSubmit()
    }
  }, [timeLeft, quizState])


  function mapQuestionType(dbType) {
  switch (dbType) {
    case "multiple_choice":
      return "single";
    case "true_false":
      return "boolean";
    case "short_answer":
    case "fill_blank":
      return "text";
    default:
      return "single";
  }
}

 

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

 
const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);
    if (!attemptId) throw new Error("Attempt not started");

    const result = await submitAttempt(attemptId, answers);
    setScore(Math.round(result.score));
    setResultDetails(result.details || []);
    setQuizState("results");

    // progress tracking
    await recordQuizProgress({
      enrollmentId: quiz?.enrollment_id || 2,
      quizId: quiz.id,
      passed: result.score >= 70,
      score: result.score,
      secondsSpent: ((initialTimeLimit ?? 600) - timeLeft) || 0,
    });
  } catch (e) {
    console.error("Submit failed:", e);
    setError(e.message || "Failed to submit quiz");
  } finally {
    setLoading(false);
  }
};



  const renderQuestion = (question) => {
    const answer = answers[question.id]

    switch (question.type) {
    case "single":
case "boolean":
  return (
    <RadioGroup
      value={answer?.toString()}
      onValueChange={(value) => handleAnswerChange(question.id, Number(value))}
    >
      {question.options.map((opt) => (
        <div key={opt.id} className="flex items-center space-x-2">
          <RadioGroupItem value={String(opt.id)} id={`q${question.id}-${opt.id}`} />
          <Label htmlFor={`q${question.id}-${opt.id}`} className="text-pretty">
            {opt.text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );


      case "multiple":
  return (
    <div className="space-y-2">
      {question.options.map((opt) => {
        const current = Array.isArray(answer) ? answer : [];
        const checked = current.includes(opt.id);
        return (
          <div key={opt.id} className="flex items-center space-x-2">
            <Checkbox
              id={`q${question.id}-${opt.id}`}
              checked={checked}
              onCheckedChange={(isOn) => {
                if (isOn) {
                  handleAnswerChange(question.id, [...current, opt.id]);
                } else {
                  handleAnswerChange(question.id, current.filter((v) => v !== opt.id));
                }
              }}
            />
            <Label htmlFor={`q${question.id}-${opt.id}`} className="text-pretty">
              {opt.text}
            </Label>
          </div>
        );
      })}
    </div>
  );

       

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
 

if (error) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">{error}</p>
    </div>
  );
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
            <Button
            type="button"
            className="w-full"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Starting…" : "Start Quiz"}
          </Button>


          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizState === "results") {
    const passed = score >= 70
    if (!questions[currentQuestion]) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Preparing your quiz...</p>
    </div>
  );
}


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
                    const detail = resultDetails.find((d) => d.question_id === question.id);
                    const isCorrect = detail?.result === "correct";
                    const userAnswerId = detail?.your;
                    const correctAnswers = detail?.correct || [];
                    const userAnswerText = (() => {
                      if (Array.isArray(userAnswerId)) {
                        return question.options
                          .filter((o) => userAnswerId.includes(o.id))
                          .map((o) => o.text)
                          .join(", ");
                      } else {
                        const opt = question.options.find((o) => o.id === userAnswerId);
                        return opt ? opt.text : String(userAnswerId ?? "—");
                      }
                    })();

                    return (
                      <div key={question.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-balance">
                              Question {index + 1}: {question.question}
                            </h4>

                            {/* User's answer */}
                            <p
                              className={`mt-2 text-sm font-medium ${
                                isCorrect ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              Your answer: {userAnswerText || "—"}
                            </p>

                            {/* Correct answer */}
                            <p className="text-sm text-muted-foreground">
                              Correct answer:{" "}
                              {correctAnswers.map((c) => c.text).join(", ") || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
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
          <CardTitle className="text-balance">
            {questions[currentQuestion]?.question || "Loading question..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions[currentQuestion] ? (
            renderQuestion(questions[currentQuestion])
          ) : (
            <p className="text-muted-foreground">Preparing your quiz...</p>
          )}

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
